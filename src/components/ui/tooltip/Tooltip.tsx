import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  children: ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export default function Tooltip({ children, text, position = 'top' }: TooltipProps) {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [alignmentClasses, setAlignmentClasses] = useState('');
  const [arrowAlignmentClasses, setArrowAlignmentClasses] = useState('left-1/2 -translate-x-1/2');

  useEffect(() => {
    if (isTooltipVisible && tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const padding = 12; // Screen edge padding
      let alignment = '';
      let arrowAlignment = 'left-1/2 -translate-x-1/2';

      if (position === 'top' || position === 'bottom') {
        if (rect.left < padding) {
          alignment = 'left-0 translate-x-0';
          arrowAlignment = 'left-4 translate-x-0';
        } else if (rect.right > window.innerWidth - padding) {
          alignment = 'right-0 left-auto translate-x-0';
          arrowAlignment = 'right-4 translate-x-0 left-auto';
        } else {
          alignment = 'left-1/2 -translate-x-1/2';
          arrowAlignment = 'left-1/2 -translate-x-1/2';
        }
      }
      setAlignmentClasses(alignment);
      setArrowAlignmentClasses(arrowAlignment);
    }
  }, [isTooltipVisible, position]);

  const positionClasses = {
    top: 'bottom-full mb-3',
    bottom: 'top-full mt-3',
    left: 'right-full mr-3 top-1/2 -translate-y-1/2',
    right: 'left-full ml-3 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: `top-full border-t-gray-900 dark:border-t-gray-700 ${arrowAlignmentClasses}`,
    bottom: `bottom-full border-b-gray-900 dark:border-b-gray-700 border-x-4 border-x-transparent border-b-4 ${arrowAlignmentClasses}`,
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-y-4 border-y-transparent border-l-4',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-y-4 border-y-transparent border-r-4',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsTooltipVisible(true)}
      onMouseLeave={() => setIsTooltipVisible(false)}
    >
      {children}
      {isTooltipVisible && (
        <div
          ref={tooltipRef}
          className={`absolute z-[9999] px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap dark:bg-gray-700 transition-opacity duration-200 ${positionClasses[position]} ${alignmentClasses}`}
        >
          {text}
          <span className={`absolute w-0 h-0 border-4 border-transparent ${arrowClasses[position]}`}></span>
        </div>
      )}
    </div>
  );
}
