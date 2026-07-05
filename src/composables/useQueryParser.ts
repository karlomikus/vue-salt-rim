/**
 * Recursive type that transforms stringified primitives into their literal types.
 */
export type ParsedPrimitives<T> = T extends string
    ? T extends "true"
        ? boolean
        : T extends "false"
          ? boolean
          : T extends `${number}`
            ? number
            : T
    : T extends Array<infer U>
      ? Array<ParsedPrimitives<U>>
      : T extends Record<string, any>
        ? { [K in keyof T]: ParsedPrimitives<T[K]> }
        : T;

/**
 * Recursively converts string-encoded primitives (numbers and booleans)
 * inside an object or array into actual JavaScript types.
 */
export function useQueryParser<T>(obj: T): ParsedPrimitives<T> {
    // Base case: Handle string conversions
    if (typeof obj === "string") {
        const lower = obj.toLowerCase();
        if (lower === "true") return true as any;
        if (lower === "false") return false as any;
        if (obj.trim() !== "" && !isNaN(Number(obj))) return Number(obj) as any;
        return obj as any;
    }

    // Handle null or non-object primitives
    if (obj === null || typeof obj !== "object") {
        return obj as any;
    }

    // Handle Arrays
    if (Array.isArray(obj)) {
        return obj.map((item) => useQueryParser(item)) as any;
    }

    // Handle Objects
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        result[key] = useQueryParser(value);
    }

    return result as ParsedPrimitives<T>;
}
