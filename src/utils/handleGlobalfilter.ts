import { GridRowModel } from "@mui/x-data-grid";

/**
 * Функция фильтрации данных в таблице по глобальному фильтру
 * @param rows оригинальные данные
 * @param filterText текст, который будет искаться в каждок ячейке
 * @returns отфильтрованный массив строк из оригинальных данных
 */
export const filterRows = (rows: GridRowModel[], filterText: string) => {
    const lowercasedFilter = filterText.toLowerCase();
    if (filterText==='') return [...rows]
    return rows.filter((row) =>
        Object.values(row).some((value) => String(value).toLowerCase().includes(lowercasedFilter))
    );
};

// подробный лог сравнения с шаблоном
// export const filterRows = (rows: GridRowModel[], filterText: string) => {
//     const lowercasedFilter = filterText.toLowerCase();
//     if (filterText==='') return [...rows]
//     const res = rows.filter((row) => { 
//         return Object.values(row).some((value) => {
//             const isContains = String(value).toLowerCase().includes(lowercasedFilter)
//             if (isContains) {console.log(row.id, "ячейка", value, String(value).toLowerCase(),  "содержит", filterText )}
//             return isContains
//         })})
//     return res
// };

