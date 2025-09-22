import type { FC, ReactNode } from "react";

interface SocialButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

const SocialButton: FC<SocialButtonProps> = ({ icon, label, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-3 py-3 px-7 text-sm font-normal text-gray-700 bg-gray-100 rounded-lg transition-colors hover:bg-gray-200 hover:text-gray-800 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
};

export default SocialButton;
