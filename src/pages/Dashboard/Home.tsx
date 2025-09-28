"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "./Dashboard.css";
import PageMeta from "../../components/common/PageMeta";
import { getDashboardData } from "../../services/DashboardService";
import TopItems from "../../components/ecommerce/TopItems";
import StockAlerts from "../../components/ecommerce/StockAlerts";
import CustomersTable from "../../components/ecommerce/CustomersTable";
import ExpiryItems from "../../components/ecommerce/ExpiryItems";
import { PencilIcon, SaveIcon, X, Eye, EyeOff, DollarSign, Package, Users, FileText } from "lucide-react";
import { getLayout, saveLayout } from "../../services/LayoutService";
import MetricCard from "../../components/ecommerce/MetricCard";
import SkeletonCard from "../../components/common/SkeletonCard";
import { usePermissions } from "../../hooks/usePermissions";
import { Layout } from "../../types/Layout";
import { DashboardData } from "../../types/Dashboard";

const ResponsiveGridLayout = WidthProvider(Responsive);

const MonthlySalesChart = lazy(() => import("../../components/ecommerce/MonthlySalesChart"));
const StatisticsChart = lazy(() => import("../../components/ecommerce/StatisticsChart"));

const componentMap = {
    MetricCard,
    MonthlySalesChart,
    StatisticsChart,
    CustomersTable,
    StockAlerts,
    ExpiryItems,
    TopItems,
};

const initialCards: Layout[] = [
  { card_id: 'total-sales', x: 0, y: 0, w: 6, h: 4, minW: 4, minH: 3, visible: true, component: 'MetricCard', props: { icon: 'DollarLineIcon', title: "Total Sales", value: 'data.metrics.total_sales_amount' } },
  { card_id: 'total-purchase', x: 6, y: 0, w: 6, h: 4, minW: 4, minH: 3, visible: true, component: 'MetricCard', props: { icon: 'BoxIconLine', title: "Total Purchase", value: 'data.metrics.total_purchase_amount' } },
  { card_id: 'total-customers', x: 12, y: 0, w: 6, h: 4, minW: 4, minH: 3, visible: true, component: 'MetricCard', props: { icon: 'GroupIcon', title: "Total Customers", value: 'data.metrics.total_customers' } },
  { card_id: 'total-items', x: 18, y: 0, w: 6, h: 4, minW: 4, minH: 3, visible: true, component: 'MetricCard', props: { icon: 'PageIcon', title: "Total Items", value: 'data.metrics.total_items' } },
  { card_id: 'monthly-sales', x: 0, y: 4, w: 12, h: 8, minW: 8, minH: 6, visible: true, component: 'MonthlySalesChart', props: { data: 'chartData.sales' } },
  { card_id: 'statistics', x: 12, y: 4, w: 12, h: 10, minW: 8, minH: 8, visible: true, component: 'StatisticsChart', props: { data: 'chartData' } },
  { card_id: 'top-customers', x: 0, y: 12, w: 12, h: 10, minW: 10, minH: 8, visible: true, component: 'CustomersTable', props: { title: "Top Customers", customers: 'data.customers.best_customers' } },
  { card_id: 'out-of-stock', x: 12, y: 14, w: 12, h: 8, minW: 10, minH: 6, visible: true, component: 'StockAlerts', props: { title: "Out of Stock Items", items: 'data.stock_alerts.out_of_stock_items', color: "error" } },
  { card_id: 'low-stock', x: 0, y: 22, w: 12, h: 8, minW: 10, minH: 6, visible: true, component: 'StockAlerts', props: { title: "Low Stock Items", items: 'data.stock_alerts.low_stock_items', color: "warning" } },
  { card_id: 'expiry-items', x: 12, y: 22, w: 12, h: 8, minW: 10, minH: 8, visible: true, component: 'ExpiryItems', props: { items: 'data.stock_alerts.expiring_items' } },
  { card_id: 'top-sold', x: 0, y: 30, w: 12, h: 8, minW: 10, minH: 8, visible: true, component: 'TopItems', props: { title: "Top Sold Items", items: 'data.top_items.sold' } },
  { card_id: 'top-purchased', x: 12, y: 30, w: 12, h: 8, minW: 10, minH: 8, visible: true, component: 'TopItems', props: { title: "Top Purchased Items", items: 'data.top_items.purchased' } },
  { card_id: 'dead-stock', x: 0, y: 38, w: 12, h: 8, minW: 10, minH: 6, visible: true, component: 'StockAlerts', props: { title: "Dead Stock Items", items: 'data.stock_alerts.dead_stock_items', color: "secondary" } },
].map(card => ({ ...card, i: card.card_id }));

const iconMap = {
  DollarLineIcon: <DollarSign className="text-gray-800 size-6 dark:text-white/90" />,
  BoxIconLine: <Package className="text-gray-800 size-6 dark:text-white/90" />,
  GroupIcon: <Users className="text-gray-800 size-6 dark:text-white/90" />,
  PageIcon: <FileText className="text-gray-800 size-6 dark:text-white/90" />,
};

function Home() {
  const { hasPermission } = usePermissions();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<{ sales: { date: string; total: number }[]; purchases: { date: string; total: number }[] } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [cards, setCards] = useState<Layout[]>([]);
  const [originalCards, setOriginalCards] = useState<Layout[]>([]);

  const getComponentProps = useCallback((props?: { [key: string]: string | number | object }) => {
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
        } else if (typeof props[key] === 'string' && (props[key] as string).startsWith('chartData.sales')) {
            newProps[key] = chartData?.sales || [];
        } else if (typeof props[key] === 'string' && props[key] === 'chartData') {
            newProps[key] = chartData || { sales: [], purchases: [] };
        }
    }
    return newProps;
  }, [data, chartData]);

  useEffect(() => {
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

        const layoutRes = await getLayout();
        if (layoutRes.data.results && layoutRes.data.results.length > 0) {
          const adaptedLayout = layoutRes.data.results.map((item: Layout) => {
            const initialCard = initialCards.find(c => c.card_id === item.card_id);
            return {
              ...item,
              i: item.card_id,
              w: item.width || initialCard?.w || 12,
              h: item.height || initialCard?.h || 4,
              x: item.x,
              y: item.y,
              component: initialCard?.component,
              props: initialCard?.props,
              minW: initialCard?.minW,
              minH: initialCard?.minH,
            };
          });
          setCards(adaptedLayout);
        } else {
          setCards(initialCards);
          const layoutToSave: Layout[] = initialCards.map(card => {
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
              card_id: i,
            };
          });
          await saveLayout(layoutToSave);
        }
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const onLayoutChange = (newLayout: ReactGridLayout.Layout[]) => {
    setCards(prevCards =>
      prevCards.map(card => {
        const layoutItem = newLayout.find((item) => item.i === card.i);
        return layoutItem ? { ...card, ...layoutItem } : card;
      })
    );
  };

  const handleSave = async () => {
    const layoutToSave: Layout[] = cards.map(card => {
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
        card_id: i,
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
    setCards(prevCards =>
      prevCards.map(card =>
        card.i === cardId ? { ...card, visible: !card.visible } : card
      )
    );
  };

  if (!hasPermission("view-dashboard")) {
    return <div>This is dashboard</div>;
  }

  if (loading) {
    const skeletonLayouts = {
      lg: initialCards.map(({ i, x, y, w, h, minW, minH }) => ({ i, x, y, w, h, minW, minH })),
    };
    return (
      <div className="p-4 space-y-6 md:p-6 2-xl:p-10">
        <ResponsiveGridLayout
          className="layout"
          layouts={skeletonLayouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
          rowHeight={25}
          isDraggable={false}
          isResizable={false}
        >
          {initialCards.map(card => (
            <div key={card.i}>
              <SkeletonCard />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
    );
  }

  const cardsToRender = editMode ? cards : cards.filter(c => c.visible);
  const layouts = {
    lg: cardsToRender.map(({ i, x, y, w, h, minW, minH }) => ({ i, x, y, w, h, minW, minH })),
  };

  return (
    <>
      <PageMeta
        title="Ecommerce Dashboard"
        description="Ecommerce dashboard page"
      />
      <div>
        <div className="flex justify-end gap-2 mb-4">
          {!editMode ? (
            <button onClick={handleEnterEditMode} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 dark:text-white">
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
          <Suspense fallback={<div className="p-4 space-y-6 md:p-6 2-xl:p-10">
            <ResponsiveGridLayout
              className="layout"
              layouts={{ lg: initialCards.map(({ i, x, y, w, h, minW, minH }) => ({ i, x, y, w, h, minW, minH })) }}
              breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
              cols={{ lg: 24, md: 20, sm: 12, xs: 8, xxs: 4 }}
              rowHeight={25}
              isDraggable={false}
              isResizable={false}
            >
              {initialCards.map(card => (
                <div key={card.i}>
                  <SkeletonCard />
                </div>
              ))}
            </ResponsiveGridLayout>
          </div>}>
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
              {cardsToRender.map(card => {
                const Component = componentMap[card.component as keyof typeof componentMap];
                const resolvedProps = getComponentProps(card.props as { [key:string]: string | number | object });
                return (
                  <div key={card.i} className={`dashboard-card-wrapper ${!card.visible && editMode ? 'opacity-50' : ''}`}>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {Component ? <Component {...resolvedProps as any} /> : null}
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
