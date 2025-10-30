/**
 * Removes transparency classes from className strings
 * Matches patterns like: bg-white/50, bg-muted/30, bg-muted/50, etc.
 */
export function removeTransparencyClasses(className: string): string {
  return className.replace(/\bbg-(\w+)\/\d+\b/g, 'bg-$1');
}
