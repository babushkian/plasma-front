import { useState, useEffect } from "react";
import {logistGetPrograms} from "../../utils/requests"
import { ProgramType } from "../Master/Master.types";
const Logist= () =>{
    
    const [data, setData] = useState<ProgramType[]>([]);
    const [loading, setLoading] = useState(false);
    const [showTable, setShowTable] = useState(false);


    const loadData = () => {
        // нужно получить жанные о работниках и соединить дба запроса в одну структуру
        const loader = async () => {
        setShowTable(false);
        setLoading(true);
        const responseData = await logistGetPrograms()
            if (responseData !== undefined) {
                console.log(responseData)
                setData(responseData);
                console.log("данные с сревера:", responseData);
                setLoading(false);
                setShowTable(true);
            }
        }
        loader()
    };

    useEffect(()=>loadData(), [])


    return (
        <>
        <h2>Рабочее место логиста</h2>
        <table>
                <tbody>
                    {data?.map((row) => {
                        return (
                            <tr key={row.id}>
                                <td>{row.ProgramName}</td>
                                <td>{row.MachineName}</td>
                                <td>
                                    {Math.round(row.SheetLength)} x {Math.round(row.SheetWidth)} x {row.Thickness}
                                </td>
                                <td>{row.fio_doer_id}</td>
                                
                            </tr>
                        );
                    })}
                </tbody>
            </table>

        </>
    )
}
export default Logist