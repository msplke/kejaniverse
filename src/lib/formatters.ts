export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "KES",
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  return formatter.format(new Date(date));
}
