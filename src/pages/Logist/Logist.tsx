import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDoers, logistGetPrograms } from "../../utils/requests";
import { ProgramType } from "../Master/Master.types";

export type ProgramAndFioType = ProgramType & { doerFio: string };

const Logist = () => {
    const [data, setData] = useState<ProgramAndFioType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [showTable, setShowTable] = useState(false);

    // нужно получить данные о работниках и соединить дба запроса в одну структуру
    const loader = async () => {
        setShowTable(false);
        setLoading(true);
        const responseData = await logistGetPrograms();
        const doers = await getDoers();

        if (responseData !== undefined && doers !== undefined) {
            // делаем словарь, где ключи - идентификаторы исполнителей, а значения - имена исполнителей
            const doersMap = doers.map((entry) => [entry.id.toString(), entry.fio_doer]);
            const doersDict = Object.fromEntries(doersMap);
            // добавляем имя исполнителя в каждую запись

            const fioData = responseData.map((item) => {
                let doerFio = "ошибоный индекс";
                if (item.fio_doer_id !== null) {
                    doerFio =
                        doersDict[item.fio_doer_id.toString()] !== undefined
                            ? doersDict[item.fio_doer_id.toString()]
                            : "ошибоный индекс";
                }
                return { ...item, doerFio };
            });
            setData(fioData);
            setLoading(false);
            setLoadError(false);
            setShowTable(true);
        } else {
            setLoading(false);
            setLoadError(true);
        }
    };

    useEffect(() => {
        loader();
    }, []);

    return (
        <>
            <h2>Рабочее место логиста</h2>
            {loadError && <div>Ошибка загрузки</div>}
            {showTable && (
                <table>
                    <tbody>
                        {data?.map((row) => {
                            return (
                                <tr key={row.id}>
                                    <td>
                                        <Link to={`/logist/${row.ProgramName}`} state={row}>
                                            {" "}
                                            {row.ProgramName}{" "}
                                        </Link>
                                    </td>
                                    <td>{row.MachineName}</td>
                                    <td>
                                        {Math.round(row.SheetLength)} x {Math.round(row.SheetWidth)} x {row.Thickness}
                                    </td>
                                    <td>{row.fio_doer_id}</td>
                                    <td>{row.doerFio}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </>
    );
};
export default Logist;
