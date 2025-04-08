import { useCallback, useEffect, useState } from "react";

/**
 * Хук нужен для учета измененных строк в таблице и очистки списка измененных стролбцов
 */
export function useModifiedRows() {
    const [modifiedRows, setModifiedRows] = useState<Set<number>>(new Set());

    const updateModifiedRows = useCallback((rowId: number) => {
        if (!modifiedRows.has(rowId)) {
            setModifiedRows((prev) => {
                const next = new Set(prev);
                next.add(rowId);
                return next;
            });
        }
    }, [modifiedRows]);

    useEffect(() => console.log("модифицированные столбцы", modifiedRows), [modifiedRows]);
    
    const clearModifiedRows = useCallback(() => {
        setModifiedRows(new Set());
    }, []);
    return { modifiedRows, clearModifiedRows, updateModifiedRows };
}
