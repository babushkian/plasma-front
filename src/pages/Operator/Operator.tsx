import { useRef, useState, useEffect, useContext } from "react";
import {
    Box,
    Button,
    Checkbox,
    FormControl,
    InputLabel,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { getDoers, getMyPrograms, OperatorStartProgram } from "../../utils/requests";
import { DoerType, ProgramType } from "../Master/Master.types";
import { UserContext } from "../../context";

const columnFields = ["id", "ProgramName", "program_status", "program_priority"];

const Operator = () => {

    const userContext = useContext(UserContext)
    if (!userContext){
        throw new Error("не определено начальное значение для конекста пользователя")
    }
    const {currentUserId, setCurrentUserId} = userContext
    console.log("пользователь", currentUserId)
    const columns = useRef<GridColDef[]>([]);
    const [doers, setDoers] = useState<DoerType[]>([]);
    const [currentDoer, setCurrentDoer] = useState<DoerType | null>(null);
    const [usersLoaded, setUsersLoaded] = useState(false);
    const [rawPrograms, setRawPrograms] = useState<ProgramType[] | null>(null);
    const [showTable, setShowTable] = useState(false);

    const load = async () => {
        const response = await getDoers();
        if (response) {
            console.log("ответ сервера", response);
            setDoers(response);
            setCurrentDoer(response[0]);
            setUsersLoaded(true);
        }
    };

    useEffect(() => {
        load();
    }, []);

    /**
     * Загрузка программы для отображения в таблице по идентификатору оператора
     * @param fio_id - идентификатор оператора
     */
    const loadPrograms = async (fio_id: number) => {
        setShowTable(false);
        const data = await getMyPrograms(fio_id);
        if (typeof data !== "undefined") {
            console.log(data);
            setRawPrograms(data);
        }
    };

    const createColumns = () => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: columnname,
                flex: 1,
            };
            if (columnname == "ProgramName") {
                col = {
                    ...col,
                    renderCell: (params) => (
                        <MuiLink
                            component={Link}
                            state={{ program: params.row}}
                            to={`/operator/${params.row.ProgramName}`}
                        >
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            return col;
        });
        clmns.push({
            field: "action",
            headerName: "action",
            flex: 0.5,
            renderCell: (params) => {
                switch (params.row.program_status) {
                    case "распределена":
                        return <Button variant="contained" onClick={()=>changeProgramStatus(params.id)} >в работу</Button>;
                    case "в работе":
                        return <Button variant="contained" onClick={()=>changeProgramStatus(params.id, "распределена")} >остановить</Button>;
                    default:
                        return <p></p>
                }

               
            },
        });
        return clmns;
    };

    const changeProgramStatus  = async (rowId:number, new_status?:string) => {
        const result = await OperatorStartProgram(rowId, new_status)
        if (result?.msg) {
            console.log(result)
            if (currentDoer) {
                loadPrograms(currentDoer.id);
                setShowTable(true);
            }

        }        
    }

    useEffect(() => {
        if (rawPrograms !== null) {
            columns.current = createColumns();
            setShowTable(true);
        }
    }, [rawPrograms]);

    useEffect(() => {
        if (currentDoer) {
            loadPrograms(currentDoer?.id);
        }
    }, [currentDoer]);

    const hadleSelectDoer = (event) => {
        console.log("выбрали работника:", event.target.value);
        const selectedDoer = doers.filter((item) => item.id == event.target.value)[0]
        setCurrentDoer(selectedDoer);
        setCurrentUserId(selectedDoer.id)
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место оператора</Typography>
                {usersLoaded && (
                    <>
                        <FormControl sx={{ m: 1, width: 300 }}>
                            <InputLabel id="master-program-doers">Работник</InputLabel>
                            <Select
                                labelId="master-program-doers"
                                // sx={{ m: 1, minWidth: 200, height: 36, fontSize: 14 }}
                                input={<OutlinedInput label="Name" />}
                                onChange={hadleSelectDoer}
                                //value={currentDoer.id}
                                value={currentUserId}
                                displayEmpty={true}
                            >
                                {doers.map((doer) => (
                                    <MenuItem value={doer.id} key={doer.id}>
                                        {doer.fio_doer}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </>
                )}
                {showTable && (
                    <div style={{ height: 600, width: "100%" }}>
                        <DataGrid rows={rawPrograms} columns={columns.current} />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Operator;
