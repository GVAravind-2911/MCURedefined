"use client";

import {
	createContext,
	useContext,
	useState,
	useMemo,
	type ReactNode,
} from "react";

interface EditingContextType {
	isEditing: boolean;
	setIsEditing: (value: boolean) => void;
}

const EditingContext = createContext<EditingContextType | undefined>(undefined);

export function EditingProvider({ children }: { children: ReactNode }) {
	const [isEditing, setIsEditing] = useState(false);

	// Memoize context value to prevent unnecessary re-renders
	const value = useMemo(() => ({ isEditing, setIsEditing }), [isEditing]);

	return (
		<EditingContext.Provider value={value}>{children}</EditingContext.Provider>
	);
}

export function useEditingContext() {
	const context = useContext(EditingContext);
	if (context === undefined) {
		throw new Error("useEditingContext must be used within an EditingProvider");
	}
	return context;
}
