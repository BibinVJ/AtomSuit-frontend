import Link from "next/link";
import { useRouter } from "next/navigation";

interface BreadcrumbProps {
  pageTitle: string;
  breadcrumbs?: { label: string; path: string }[];
  backButton?: boolean;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, breadcrumbs, backButton = false }) => {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-4">
        {backButton && (
          <button onClick={() => router.push(-1)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <h2
          className="text-xl font-semibold text-gray-800 dark:text-white/90"
        >
          {pageTitle}
        </h2>
      </div>

      <nav>
        <ol className="flex items-center gap-1.5">
          <li>
            <Link
              className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
              href="/"
            >
              Home
            </Link>
          </li>
          {breadcrumbs?.map((breadcrumb, index) => (
            <li key={index} className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-gray-400">
              <svg
                className="stroke-current"
                width="17"
                height="16"
                viewBox="0 0 17 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                  stroke=""
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Link
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400"
                to={breadcrumb.path}
              >
                {breadcrumb.label}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5 text-sm text-gray-800 dark:text-white/90">
            <svg
              className="stroke-current"
              width="17"
              height="16"
              viewBox="0 0 17 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.0765 12.667L10.2432 8.50033L6.0765 4.33366"
                stroke=""
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {pageTitle}
          </li>
        </ol>
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
