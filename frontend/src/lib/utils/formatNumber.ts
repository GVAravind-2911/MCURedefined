/**
 * Format number as abbreviated string (1k, 1.5M, etc.)
 * @param num The number to format
 * @returns Formatted string
 */
export function formatNumber(num: number): string {
	if (num < 1000) return num.toString();

	const units = ["", "k", "M", "B", "T"];
	const unit = Math.floor(Math.log10(num) / 3);
	const value = num / 1000 ** unit;
	const formattedValue = value.toFixed(value < 10 ? 1 : 0);

	// Remove trailing .0 if present
	return Number.parseFloat(formattedValue) + units[unit];
}
