export const formatKebabCase = (str: string): string => {
  if (!str) return '';
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
export const formatLabel = (str: string): string => {
  if (!str) return '';
  const formatted = str.replace(/[_-]/g, ' ');
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};
