import type { FC } from "react";

interface DividerProps {
  text?: string;
}

const Divider: FC<DividerProps> = ({ text = "Or" }) => {
  return (
    <div className="relative py-3 sm:py-5">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-gray-800" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white dark:bg-gray-900 px-5 py-2 text-gray-400">{text}</span>
      </div>
    </div>
  );
};

export default Divider;
