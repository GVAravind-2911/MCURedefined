import { useState, useCallback, useRef } from "react";

interface UseUndoRedoOptions {
  maxHistory?: number;
  debounceMs?: number;
}

type SetStateAction<T> = T | ((prevState: T) => T);

interface UseUndoRedoReturn<T> {
  state: T;
  setState: (newState: SetStateAction<T>, skipHistory?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

export function useUndoRedo<T>(
  initialState: T,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<T> {
  const { maxHistory = 50, debounceMs = 300 } = options;
  
  const [state, setStateInternal] = useState<T>(initialState);
  const [history, setHistory] = useState<T[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedStateRef = useRef<T>(initialState);
  const stateRef = useRef<T>(initialState);
  
  // Keep stateRef in sync
  stateRef.current = state;

  const setState = useCallback((newStateOrFn: SetStateAction<T>, skipHistory = false) => {
    // Resolve the new state (support both direct value and callback)
    const newState = typeof newStateOrFn === "function"
      ? (newStateOrFn as (prevState: T) => T)(stateRef.current)
      : newStateOrFn;
    
    setStateInternal(newState);
    stateRef.current = newState;
    
    if (skipHistory) {
      // When skipping history (e.g., initial load), reset history to this state
      // so undo doesn't go back to the empty initial state
      setHistory([newState]);
      setHistoryIndex(0);
      lastSavedStateRef.current = newState;
      return;
    }
    
    // Debounce history saves for text input
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      // Only save if state actually changed
      if (JSON.stringify(newState) === JSON.stringify(lastSavedStateRef.current)) {
        return;
      }
      
      lastSavedStateRef.current = newState;
      
      setHistory((prev) => {
        // Remove any future history if we're not at the end
        const newHistory = prev.slice(0, historyIndex + 1);
        newHistory.push(newState);
        
        // Limit history size
        if (newHistory.length > maxHistory) {
          newHistory.shift();
          return newHistory;
        }
        
        return newHistory;
      });
      
      setHistoryIndex((prev) => Math.min(prev + 1, maxHistory - 1));
    }, debounceMs);
  }, [historyIndex, maxHistory, debounceMs]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousState = history[newIndex];
      setStateInternal(previousState);
      stateRef.current = previousState;
      lastSavedStateRef.current = previousState;
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextState = history[newIndex];
      setStateInternal(nextState);
      stateRef.current = nextState;
      lastSavedStateRef.current = nextState;
    }
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([state]);
    setHistoryIndex(0);
    stateRef.current = state;
    lastSavedStateRef.current = state;
  }, [state]);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    clearHistory,
  };
}

// Simpler version for text input with better performance
export function useTextUndoRedo(
  initialText: string,
  onChange?: (text: string) => void,
  options: UseUndoRedoOptions = {}
): UseUndoRedoReturn<string> & { syncExternal: (text: string) => void } {
  const { maxHistory = 100, debounceMs = 500 } = options;
  
  const [text, setTextInternal] = useState(initialText);
  const historyRef = useRef<string[]>([initialText]);
  const indexRef = useRef(0);
  const [, forceUpdate] = useState({});
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef(initialText);

  const setText = useCallback((newText: string, skipHistory = false) => {
    setTextInternal(newText);
    onChange?.(newText);
    
    if (skipHistory) return;
    
    // Debounce history saves
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (newText === lastSavedRef.current) return;
      
      lastSavedRef.current = newText;
      
      // Remove future history
      historyRef.current = historyRef.current.slice(0, indexRef.current + 1);
      historyRef.current.push(newText);
      
      // Limit history
      if (historyRef.current.length > maxHistory) {
        historyRef.current.shift();
      } else {
        indexRef.current++;
      }
      
      forceUpdate({});
    }, debounceMs);
  }, [onChange, maxHistory, debounceMs]);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current--;
      const prevText = historyRef.current[indexRef.current];
      setTextInternal(prevText);
      lastSavedRef.current = prevText;
      onChange?.(prevText);
      forceUpdate({});
    }
  }, [onChange]);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current++;
      const nextText = historyRef.current[indexRef.current];
      setTextInternal(nextText);
      lastSavedRef.current = nextText;
      onChange?.(nextText);
      forceUpdate({});
    }
  }, [onChange]);

  const clearHistory = useCallback(() => {
    historyRef.current = [text];
    indexRef.current = 0;
    lastSavedRef.current = text;
    forceUpdate({});
  }, [text]);

  // Sync with external content without adding to history
  const syncExternal = useCallback((newText: string) => {
    if (newText !== text) {
      setTextInternal(newText);
      // Don't clear history, just update current state
    }
  }, [text]);

  return {
    state: text,
    setState: setText,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    clearHistory,
    syncExternal,
  };
}
