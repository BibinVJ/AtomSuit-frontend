import { ReactNode } from "react";
import { Filter } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  title: string;
  children: ReactNode;
  showFilter?: boolean;
  showSeeAll?: boolean;
  seeAllLink?: string;
}

export default function TableSection({
  title,
  children,
  showFilter = false,
  showSeeAll = false,
  seeAllLink,
}: Props) {
  const router = useRouter();

  const handleSeeAll = () => {
    if (seeAllLink) {
      router.push(seeAllLink);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 custom-card-bg px-4 pb-3 pt-4 dark:border-gray-800 sm:px-6 h-full flex flex-col">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>

        {(showFilter || showSeeAll) && (
          <div className="flex items-center gap-3">
            {showFilter && (
              <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            )}
            {showSeeAll && seeAllLink && (
              <button
                onClick={handleSeeAll}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
              >
                See all
              </button>
            )}
          </div>
        )}
      </div>

      <div className="max-w-full overflow-auto flex-grow">{children}</div>
    </div>
  );
}
