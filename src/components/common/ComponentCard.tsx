interface ComponentCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string; // Additional custom classes for styling
  desc?: string; // Description text
  action?: React.ReactNode; // Optional action element (e.g., button) in header
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
  action,
}) => {
  const showHeader = title || desc || action;

  return (
    <div
      className={`rounded-2xl border border-gray-200 custom-card-bg dark:border-gray-800 ${className}`}
    >
      {/* Card Header */}
      {showHeader && (
        <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
                {title}
              </h3>
            )}
            {desc && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {desc}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}

      {/* Card Body */}
      <div className={`p-4 ${showHeader ? 'border-t border-gray-100 dark:border-gray-800' : ''} sm:p-6`}>
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
