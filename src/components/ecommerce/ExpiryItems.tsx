import TableSection from "../ui/table/TableSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

interface ExpiringItem {
  id: number;
  sku: string;
  name: string;
  batch_number: string;
  expiry_date: string; // ISO string
  stock_remaining: number;
}

interface Props {
  items: ExpiringItem[] | ExpiringItem;
  title?: string;
}

export default function ExpiryItems({
  items,
  title = "Expiring Items",
}: Props) {
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

  const now = new Date();

  return (
    <TableSection title={title}>
      <Table>
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
              Batch
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
            >
              Expiry Date
            </TableCell>
            <TableCell
              isHeader
              className="py-3 text-start font-medium text-theme-xs text-gray-500 dark:text-gray-400"
            >
              Remaining Stock Qty
            </TableCell>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {itemsArray.map((item) => {
            const expiryDate = new Date(item.expiry_date);
            const isExpired = expiryDate < now;
            const badgeColor = isExpired ? "error" : "warning";

            return (
              <TableRow key={`${item.id}-${item.batch_number}`}>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {item.sku}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {item.name}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {item.batch_number}
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  <Badge size="sm" color={badgeColor}>
                    {expiryDate.toLocaleDateString()}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                  {item.stock_remaining}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableSection>
  );
}
