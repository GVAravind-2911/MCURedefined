import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for debouncing a value.
 * Returns the debounced value that only updates after the specified delay.
 * 
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}

/**
 * Custom hook for debouncing a callback function.
 * Returns a debounced version of the callback that only executes
 * after the specified delay since the last call.
 * 
 * @param callback - The function to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns The debounced callback function
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
	callback: T,
	delay: number = 300
): (...args: Parameters<T>) => void {
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);
	const callbackRef = useRef(callback);

	// Update callback ref on each render
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	return useCallback(
		(...args: Parameters<T>) => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			timeoutRef.current = setTimeout(() => {
				callbackRef.current(...args);
			}, delay);
		},
		[delay]
	);
}

/**
 * Custom hook for debounced state management.
 * Returns the current value, setter, and debounced value.
 * Useful when you need immediate UI updates but debounced API calls.
 * 
 * @param initialValue - The initial state value
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 * @returns Tuple of [currentValue, setValue, debouncedValue]
 */
export function useDebouncedState<T>(
	initialValue: T,
	delay: number = 300
): [T, (value: T) => void, T] {
	const [value, setValue] = useState<T>(initialValue);
	const debouncedValue = useDebounce(value, delay);

	return [value, setValue, debouncedValue];
}

export default useDebounce;
