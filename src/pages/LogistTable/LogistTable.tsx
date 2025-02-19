import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { ProgramAndFioType } from "../Logist/Logist";

import { masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "./LogistTable.types";
import QtyInput from "../../components/QtyInput/QtyInput"

const LogistTable = () => {
    const { state }: { state: ProgramAndFioType } = useLocation();
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    console.log("переданныый через ссылку объект", state);

    useEffect(() => {
        async function loader() {
            setLoading(true);
            setShowTable(false);
            const response = await masterGetDetailsByProgramId(state.id);
            if (response !== undefined) {
                setData(response);
                setLoading(false);
                setShowTable(true);
            } else {
                setLoading(false);
                setLoadError(true);
            }
        }
        loader();
    }, []);

    const setQty:(rowId:number, qty:number)=> void  = (rowId, qty)=> console.log(rowId, qty)

    // столбцы, которые нужно выводить в таблице
    const fields = [
        "id",
        "PartName",
        "QtyInProcess",
        "part_status",
        "fio_doer_id",
    ];

    return (
        <>
            <h2>редактирование деталей программы № {state.ProgramName} на странице логиста</h2>
            {loadError && <div>Ошибка загрузки</div>}
            {showTable && (
                <table>
                    <thead>
                        <tr>
                            {fields.map((header) => (
                                <th>{header}</th>
                            ))}
                            <th>действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((row) => {
                            return (
                                <tr key={row.id}>
                                    {fields.map((header) => (
                                        <td>{(row as Record<string, string | number | boolean | null>)[header]}</td>
                                    ))}
                                    <td> <QtyInput rowId={row.id} applyQty={setQty}> </QtyInput></td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </>
    );
};

export default LogistTable;
