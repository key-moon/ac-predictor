export default function(n: number): string {
  return `${n >= 0 ? "+" : "-"}${Math.abs(n)}`;
}
