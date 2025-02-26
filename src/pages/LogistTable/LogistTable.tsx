import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ProgramAndFioType } from "../Logist/Logist";

import { logistCalculateParts, masterGetDetailsByProgramId } from "../../utils/requests";

import { MasterProgramPartsRecordType } from "./LogistTable.types";
import QtyInput from "../../components/QtyInput/QtyInput";

type factQtyType = { id: number; qty_fact: number };
type factQtyRecordType = Record<number, factQtyType>;

const LogistTable = () => {
    const { state }: { state: ProgramAndFioType } = useLocation();
    const navigate = useNavigate();
    const [data, setData] = useState<MasterProgramPartsRecordType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);
    const [factQty, setFactQty] = useState<factQtyRecordType>({});

    const loader = async () => {
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
        console.log("Зпрос на сервер");
    };

    useEffect(() => {
        loader();
    }, []);

    const setQty: (programId: number, qty: number) => void = (programId, qty) => {
        const dataIndex = data.findIndex((item)=>programId===item.id)
        if (data[dataIndex].qty_fact === qty) {
            return;
        } else {
            // добвляем элемент в массив
            setFactQty((prev) => ({ ...prev, [programId]: { id: programId, qty_fact: qty } }));
        }
    };

    const sendQty: () => Promise<void> = async () => {
        if (Object.keys(factQty).length === 0) {
            return;
        }
        const partsQty = Object.values(factQty);
        await logistCalculateParts(partsQty);
        // сброс заполненных работников и перезагрузка страницы
        //
        setFactQty(() => ({}));
        loader();
        //navigate(0);
    };

    // столбцы, которые нужно выводить в таблице
    const fields = ["id", "PartName","WONumber", "QtyInProcess", "qty_fact", "part_status", "fio_doer_id"];

    return (
        <>
            <h2>редактирование деталей программы № {state.ProgramName} на странице логиста</h2>
            {loadError && <div>Ошибка загрузки</div>}
            {showTable && (
                <>
                    <button onClick={() => sendQty()}>Применить фактическое количество деталей</button>
                    <table>
                        <thead>
                            <tr>
                                {fields.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                                <th>действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((row) => {
                                return (
                                    <tr key={row.PK_PIP}>
                                        {fields.map((header) => (
                                            <td key={header}>
                                                {(row as Record<string, string | number | boolean | null>)[header]}
                                            </td>
                                        ))}
                                        <td>
                                            <QtyInput rowId={row.id} initialQty={row.qty_fact} applyQty={setQty} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            )}
        </>
    );
};

export default LogistTable;
