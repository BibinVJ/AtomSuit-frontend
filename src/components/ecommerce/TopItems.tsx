import TableSection from "../ui/table/TableSection";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";

interface TopItem {
  id: number;
  name: string;
  sku: string;
  total_quantity: number;
}

interface Props {
  items: TopItem[];
  title?: string;
}

export default function TopItemsTable({ items, title = "Top Items" }: Props) {
      if (!items || items.length === 0) {
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
              Qty
            </TableCell>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                {item.sku}
              </TableCell>
              <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                {item.name}
              </TableCell>
              <TableCell className="py-3 text-theme-sm text-gray-500 dark:text-gray-400">
                {item.total_quantity}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableSection>
  );
}
