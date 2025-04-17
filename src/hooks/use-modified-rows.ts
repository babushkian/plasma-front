import { useCallback, useEffect, useState } from "react";

/**
 * Хук нужен для учета измененных строк в таблице и очистки списка измененных стролбцов
 */
export function useModifiedRows() {
    const [modifiedRows, setModifiedRows] = useState<Set<number| string >>(new Set());

    const updateModifiedRows = useCallback(
        (rowId: number | string) => {
            if (!modifiedRows.has(rowId)) {
                setModifiedRows((prev) => {
                    const next = new Set(prev);
                    next.add(rowId);
                    return next;
                });
            }
        },
        [modifiedRows]
    );

    const updateManyModifiedRows = useCallback(
        (rowIds: Array<number | string>) =>
            setModifiedRows((prev) => {
                return new Set([...prev, ...rowIds]);
            }),
        []
    );

    const clearModifiedRows = useCallback(() => {
        setModifiedRows(new Set());
    }, []);
    return { modifiedRows, clearModifiedRows, updateModifiedRows, updateManyModifiedRows };
}
