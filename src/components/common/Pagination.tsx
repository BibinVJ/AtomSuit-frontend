
import Button from "../ui/button/Button";

interface Props {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  from: number;
  to: number;
  total: number;
}

export default function Pagination({ currentPage, totalPages, onPageChange, from, to, total }: Props) {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= halfPagesToShow) {
        for (let i = 1; i <= maxPagesToShow - 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - halfPagesToShow) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - maxPagesToShow + 2; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - halfPagesToShow + 1; i <= currentPage + halfPagesToShow -1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-700 dark:text-gray-400">
        Showing {from} to {to} of {total} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          variant="outline"
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {getPageNumbers().map((page, index) => (
            typeof page === 'number' ? (
              <Button
                size="xs"
                key={index}
                onClick={() => onPageChange(page)}
                variant={currentPage === page ? 'primary' : 'outline'}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="px-3 py-1 text-sm font-medium text-gray-700">
                {page}
              </span>
            )
          ))}
        </div>
        <Button
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
