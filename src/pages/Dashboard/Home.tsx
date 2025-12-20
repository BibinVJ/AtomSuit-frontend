'use client';

import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './Dashboard.css';
import PageMeta from '../../components/common/PageMeta';
import { getDashboardData } from '../../services/DashboardService';
import TopItems from '../../components/ecommerce/TopItems';
import StockAlerts from '../../components/ecommerce/StockAlerts';
import CustomersTable from '../../components/ecommerce/CustomersTable';
import ExpiryItems from '../../components/ecommerce/ExpiryItems';
import PlanDistributionChart from '../../components/ecommerce/PlanDistributionChart';
import TenantOverviewCard from '../../components/ecommerce/TenantOverviewCard';
import RevenueCard from '../../components/ecommerce/RevenueCard';
import GrowthCard from '../../components/ecommerce/GrowthCard';
import {
  PencilIcon,
  SaveIcon,
  X,
  Eye,
  EyeOff,
  DollarSign,
  Package,
  Users,
  FileText,
} from 'lucide-react';
import { getLayout, saveLayout } from '../../services/LayoutService';
import MetricCard from '../../components/ecommerce/MetricCard';
import SkeletonCard from '../../components/common/SkeletonCard';
import { useAuth } from '../../hooks/useAuth';
import { Layout } from '../../types/Layout';
import { DashboardData } from '../../types/Dashboard';

const ResponsiveGridLayout = WidthProvider(Responsive);

const MonthlySalesChart = lazy(() => import('../../components/ecommerce/MonthlySalesChart'));
const StatisticsChart = lazy(() => import('../../components/ecommerce/StatisticsChart'));

const componentMap = {
  MetricCard,
  MonthlySalesChart,
  StatisticsChart,
  CustomersTable,
  StockAlerts,
  ExpiryItems,
  TopItems,
};

// Component mapping - maps backend component names to React components
const componentNameToComponent: Record<string, React.ComponentType<any>> = {
  TotalSalesCard: MetricCard,
  TotalPurchaseCard: MetricCard,
  TotalCustomersCard: MetricCard,
  TotalItemsCard: MetricCard,
  MonthlySalesChart: MonthlySalesChart,
  StatisticsCard: StatisticsChart,
  TopCustomersCard: CustomersTable,
  OutOfStockCard: StockAlerts,
  LowStockCard: StockAlerts,
  ExpiringItemsCard: ExpiryItems,
  TopSoldCard: TopItems,
  TopPurchasedCard: TopItems,
  DeadStockCard: StockAlerts,
  // Central dashboard components
  TotalTenantsCard: MetricCard,
  ActiveTenantsCard: MetricCard,
  PaidSubscribersCard: MetricCard,
  TotalRevenueCard: MetricCard,
  TrialTenantsCard: MetricCard,
  MonthlyRevenueCard: MetricCard,
  PlanDistributionCard: PlanDistributionChart,
  RecentRegistrationsCard: MetricCard,
  ConversionRateCard: MetricCard,
  TenantOverviewCard: TenantOverviewCard,
  RevenueOverviewCard: RevenueCard,
  GrowthMetricsCard: GrowthCard,
};

// Card-specific props mapping (hardcoded for now, could be moved to backend later)
const cardPropsMap: Record<string, any> = {
  'total-sales': {
    icon: 'DollarLineIcon',
    title: 'Total Sales',
    value: 'data.metrics.total_sales_amount',
  },
  'total-purchase': {
    icon: 'BoxIconLine',
    title: 'Total Purchase',
    value: 'data.metrics.total_purchase_amount',
  },
  'total-customers': {
    icon: 'GroupIcon',
    title: 'Total Customers',
    value: 'data.metrics.total_customers',
  },
  'total-items': { icon: 'PageIcon', title: 'Total Items', value: 'data.metrics.total_items' },
  'monthly-sales': { data: 'chartData.sales' },
  statistics: { data: 'chartData' },
  'top-customers': { title: 'Top Customers', customers: 'data.customers.best_customers' },
  'out-of-stock': {
    title: 'Out of Stock Items',
    items: 'data.stock_alerts.out_of_stock_items',
    color: 'error',
  },
  'low-stock': {
    title: 'Low Stock Items',
    items: 'data.stock_alerts.low_stock_items',
    color: 'warning',
  },
  'expiry-items': { items: 'data.stock_alerts.expiring_items' },
  'top-sold': { title: 'Top Sold Items', items: 'data.top_items.sold' },
  'top-purchased': { title: 'Top Purchased Items', items: 'data.top_items.purchased' },
  'dead-stock': {
    title: 'Dead Stock Items',
    items: 'data.stock_alerts.dead_stock_items',
    color: 'secondary',
  },
  // Central dashboard cards
  'total-tenants': {
    icon: 'GroupIcon',
    title: 'Total Tenants',
    value: 'data.tenant_overview.total',
  },
  'active-tenants': {
    icon: 'GroupIcon',
    title: 'Active Tenants',
    value: 'data.tenant_overview.active',
  },
  'paid-subscribers': {
    icon: 'DollarLineIcon',
    title: 'Paid Subscribers',
    value: 'data.tenant_overview.paid_subscribers',
  },
  'total-revenue': {
    icon: 'DollarLineIcon',
    title: 'Total Revenue',
    value: 'data.revenue.total',
    prefix: '$',
  },
  'trial-tenants': {
    icon: 'GroupIcon',
    title: 'Trial Tenants',
    value: 'data.tenant_overview.on_trial',
  },
  'monthly-revenue': {
    icon: 'DollarLineIcon',
    title: 'Monthly Revenue',
    value: 'data.revenue.this_month',
    prefix: '$',
  },
  'plan-distribution': { data: 'data.plan_distribution' },
  'recent-registrations': {
    icon: 'GroupIcon',
    title: 'Recent Registrations',
    value: 'data.tenant_overview.recent_registrations',
  },
  'conversion-rate': {
    icon: 'DollarLineIcon',
    title: 'Conversion Rate',
    value: 'data.growth.conversion_rate',
  },
  'tenant-overview': { data: 'data.tenant_overview' },
  'revenue-overview': { data: 'data.revenue' },
  'growth-metrics': { data: 'data.growth' },
};

const iconMap = {
  DollarLineIcon: <DollarSign className="text-gray-800 size-6 dark:text-white/90" />,
  BoxIconLine: <Package className="text-gray-800 size-6 dark:text-white/90" />,
  GroupIcon: <Users className="text-gray-800 size-6 dark:text-white/90" />,
  PageIcon: <FileText className="text-gray-800 size-6 dark:text-white/90" />,
};

const DashboardSkeleton = () => (
  <div className="p-4 space-y-6 md:p-6 2-xl:p-10">
    <div className="flex justify-between items-center mb-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
      <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full"></div>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32">
          <SkeletonCard />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-64">
        <SkeletonCard />
      </div>
      <div className="h-64">
        <SkeletonCard />
      </div>
    </div>
  </div>
);

function Home() {
  const { hasPermission, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{
    sales: { date: string; total: number }[];
    purchases: { date: string; total: number }[];
  } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [cards, setCards] = useState<Layout[]>([]);
  const [originalCards, setOriginalCards] = useState<Layout[]>([]);

  const getComponentProps = useCallback(
    (props?: { [key: string]: string | number | object }) => {
      const getNestedValue = (obj: DashboardData, path: string) => {
        // @ts-expect-error: Inferred type as any
        return path.split('.').reduce((acc, part) => acc?.[part], obj);
      };

      const newProps: { [key: string]: unknown } = { ...props };
      if (!props || !data) return {};

      for (const key in props) {
        if (key === 'icon' && typeof props[key] === 'string') {
          newProps[key] = iconMap[props[key] as keyof typeof iconMap];
        } else if (typeof props[key] === 'string' && (props[key] as string).startsWith('data.')) {
          const value = getNestedValue(data, (props[key] as string).substring(5));
          newProps[key] = value;
        } else if (
          typeof props[key] === 'string' &&
          (props[key] as string).startsWith('chartData.sales')
        ) {
          newProps[key] = chartData?.sales || [];
        } else if (typeof props[key] === 'string' && props[key] === 'chartData') {
          newProps[key] = chartData || { sales: [], purchases: [] };
        } else if (
          typeof props[key] === 'string' &&
          (props[key] as string) === 'data.plan_distribution'
        ) {
          // Pass plan distribution data directly to PlanDistributionChart
          newProps[key] = data.plan_distribution || {};
        }
      }
      return newProps;
    },
    [data, chartData]
  );

  useEffect(() => {
    // Wait for auth to initialize and check permission
    if (authLoading || !hasPermission('view-dashboard')) return;

    const fetchInitialData = async () => {
      try {
        const dashboardRes = await getDashboardData();
        const results = dashboardRes.data.data;
        setData(results);

        const transformedChartData = {
          sales: results.charts?.sales || [],
          purchases: results.charts?.purchases || [],
        };
        setChartData(transformedChartData);

        // Fetch user's dashboard layout from backend
        // Backend automatically filters cards based on user permissions
        // Only cards the user has permission to view are returned
        const layoutRes = await getLayout();
        if (layoutRes.data.data && layoutRes.data.data.length > 0) {
          // Backend returned permission-filtered layouts
          const adaptedLayout = layoutRes.data.data.map((item: any) => {
            return {
              ...item,
              i: item.slug || item.dashboard_card_id.toString(),
              dashboard_card_id: item.dashboard_card_id,
              slug: item.slug,
              w: item.width || item.default_width || 12,
              h: item.height || item.default_height || 4,
              x: item.x || 0,
              y: item.y || 0,
              component: item.component, // Backend provides component name
              props: cardPropsMap[item.slug || ''], // Local props mapping
              minW: 4,
              minH: 3,
            };
          });
          setCards(adaptedLayout);
        } else {
          // Backend returns empty on first load, will auto-initialize on next request
          // Frontend displays empty dashboard until backend initializes layouts
          setCards([]);
        }
      } catch (err) {
        console.error('Dashboard fetch failed', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [authLoading, hasPermission]);

  const onLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    setCards((prevCards) =>
      prevCards.map((card) => {
        const layoutItem = newLayout.find((item) => item.i === card.i);
        return layoutItem ? { ...card, ...layoutItem } : card;
      })
    );
  };

  const handleSave = async () => {
    const layoutToSave: Layout[] = cards.map((card) => {
      const { i, w, h, x, y, visible, draggable, area, rotation, col_span, config } = card;
      return {
        i,
        w,
        h,
        x,
        y,
        visible: visible === false ? false : true,
        draggable: draggable === false ? false : true,
        area: area || null,
        rotation: rotation || 0,
        col_span: col_span || null,
        config: config || undefined,
        dashboard_card_id: card.dashboard_card_id,
      };
    });
    await saveLayout(layoutToSave);
    setEditMode(false);
  };

  const handleEnterEditMode = () => {
    setOriginalCards(cards);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setCards(originalCards);
    setEditMode(false);
  };

  const handleToggleVisibility = (cardId: string) => {
    setCards((prevCards) =>
      prevCards.map((card) => (card.i === cardId ? { ...card, visible: !card.visible } : card))
    );
  };

  if (!hasPermission('view-dashboard')) {
    return <div>This is dashboard</div>;
  }

  if (loading || authLoading) {
    return <DashboardSkeleton />;
  }

  const cardsToRender = editMode ? cards : cards.filter((c) => c.visible);
  const layouts = {
    lg: cardsToRender.map(({ i, x, y, w, h, minW, minH }) => ({ i, x, y, w, h, minW, minH })),
  };

  return (
    <>
      <PageMeta title="Ecommerce Dashboard" description="Ecommerce dashboard page" />
      <div>
        <div className="flex justify-end gap-2 mb-4">
          {!editMode ? (
            <button
              onClick={handleEnterEditMode}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-white"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
          ) : (
            <>
              <button onClick={handleSave} className="p-2 rounded-full bg-blue-500 text-white">
                <SaveIcon className="w-5 h-5" />
              </button>
              <button onClick={handleCancelEdit} className="p-2 rounded-full bg-red-500 text-white">
                <X className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
        {!loading && cards.length > 0 && (
          <Suspense fallback={<DashboardSkeleton />}>
            <ResponsiveGridLayout
              className="layout"
              layouts={layouts}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
              rowHeight={25}
              onLayoutChange={onLayoutChange}
              isDraggable={editMode}
              isResizable={editMode}
              draggableCancel=".cancel-drag"
            >
              {cardsToRender.map((card) => {
                // Map backend component name to actual React component
                const Component = card.component
                  ? componentNameToComponent[card.component] ||
                    componentMap[card.component as keyof typeof componentMap]
                  : null;
                if (!Component) {
                  console.warn('Component not found for:', card.component, 'slug:', card.slug);
                }
                const resolvedProps = getComponentProps(
                  card.props as { [key: string]: string | number | object }
                );
                return (
                  <div
                    key={card.i}
                    className={`dashboard-card-wrapper ${!card.visible && editMode ? 'opacity-50' : ''}`}
                  >
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {Component ? (
                      <Component {...(resolvedProps as any)} />
                    ) : (
                      <div className="p-4 text-red-500">Component not found: {card.component}</div>
                    )}
                    {editMode && (
                      <button
                        className="absolute top-4 right-4 z-10 p-1 bg-gray-200 rounded-full hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 cancel-drag"
                        onClick={() => handleToggleVisibility(card.i)}
                      >
                        {card.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    )}
                  </div>
                );
              })}
            </ResponsiveGridLayout>
          </Suspense>
        )}
      </div>
    </>
  );
}

export default Home;
