import TableSection from "../ui/table/TableSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface TopItem {
  id: number;
  sku: string;
  name: string;
  stock_remaining: number;
}

interface Props {
  items: TopItem[] | TopItem;
  title?: string;
  color?: "success" | "error" | "warning" | "secondary";
}

export default function StockAlerts({ items, title = "Stock Alert", color = "error" }: Props) {
  const itemsArray = Array.isArray(items) ? items : (items ? [items] : []);

  if (itemsArray.length === 0) {
    return (
      <TableSection title={title}>
        <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
          No data available.
        </div>
      </TableSection>
    );
  }

  return (
    <TableSection title={title}>
      <Table>
        {/* Table Header */}
        <TableHeader className="border-y border-gray-100 dark:border-gray-800">
          <TableRow>
            <TableCell
              isHeader
              className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
            >
              SKU
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
            >
              Item
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
            >
              Remaining Stock Qty
            </TableCell>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {itemsArray.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                {item.sku}
              </TableCell>
              <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                {item.name}
              </TableCell>
              <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                <Badge size="sm" color={color}>
                  {item.stock_remaining}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableSection>
  );
}

