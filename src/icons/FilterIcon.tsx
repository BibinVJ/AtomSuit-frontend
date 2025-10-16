export default function FilterIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`stroke-current fill-white dark:fill-gray-800 ${className}`}
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M2.29 5.904H17.707" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.708 14.096H2.291" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M12.083 3.333c1.42 0 2.571 1.151 2.571 2.571s-1.151 2.571-2.571 2.571S9.512 7.324 9.512 5.904 10.663 3.333 12.083 3.333Z"
        fill=""
        strokeWidth="1.5"
      />
      <path
        d="M7.917 11.525c-1.42 0-2.571 1.151-2.571 2.571s1.151 2.571 2.571 2.571 2.571-1.151 2.571-2.571-1.151-2.571-2.571-2.571Z"
        fill=""
        strokeWidth="1.5"
      />
    </svg>
  );
}
