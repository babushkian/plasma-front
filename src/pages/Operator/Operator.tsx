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
import CustomToolbar from "../../components/CustomToolbar/CustomToolbar";
import { getDoers, getMyPrograms, OperatorStartProgram } from "../../utils/requests";
import { DoerType, ProgramType } from "../Master/Master.types";
import { OperatorSelectContext, UserContext } from "../../context.tsx";
import { hiddenIdColumn } from "../../utils/tableInitialState.ts";
import { Theme, styled } from '@mui/material/styles';
import { minimalContentHeight } from "@mui/x-data-grid/hooks/features/rows/gridRowsUtils";

//const columnFields = ["id", "ProgramName", "program_status", "program_priority"];
const columnFields = [
    "program_priority",
    "ProgramName",
    "program_status",
    // "wo_numbers",
    // "wo_data1",
    "fio_doer",
    "Thickness",
    "SheetWidth",
    "SheetLength",
];




// const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
//     border: 2,
//     //color: 'rgba(175, 0, 0, 0.85)',
//     WebkitFontSmoothing: 'auto',
//     letterSpacing: 'normal',
//     '& .MuiDataGrid-columnsContainer': {
//       backgroundColor: '#1d1d1d',
//       ...theme.applyStyles('dark', {
//         backgroundColor: '#fafafa',
//       }),
//     },
//     '& .MuiDataGrid-iconSeparator': {
//       display: 'none',
//     },
//     '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
//       //borderRight: '1px solid #303030',
//       borderRight: '1px solid rgba(248, 191, 2,  0.64)',
//       ...theme.applyStyles('dark', {
//         //borderRightColor: '#f0f0f0',
//         //borderBottomColor: "rgba(196, 191, 168, 0.42)",
//       }),
//     },
//     '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
//       borderBottom: '1px solid rgba(255, 196, 0, 0.64)',
//       ...theme.applyStyles('dark', {
//         //borderBottomColor: '#f0f0f0',
//        // borderBottomColor: "rgba(255, 246, 196, 0.42)",
//         //borderColor: "rgba(255, 246, 196, 0.42)"
//       }),
//     },

//     '& .MuiDataGrid-cell': {
//       color: 'rgba(255,255,255,0.65)',
//       ...theme.applyStyles('dark', {
//         color: 'rgba(235, 235, 235, 0.85)',
//       }),
//     },

//     '& .MuiPaginationItem-root': {
//       borderRadius: 2,
//     },

//     // ...theme.applyStyles('dark', {
//     //   color: 'rgba(0,0,0,.85)',
//     // }),
//   }));




const Operator = () => {
    const operatorIdContext = useContext(OperatorSelectContext);
    const currentUserContext = useContext(UserContext);

    if (!operatorIdContext) {
        throw new Error("не определено начальное значение для конекста оператора");
    }
    if (!currentUserContext) {
        throw new Error("не определено начальное значение для конекста пользователя");
    }

    const { currentUser } = currentUserContext;
    const { selectedOperatorId, setSelectedOperatorId } = operatorIdContext;

    console.log("идентификатор пользователя", currentUser.id);
    console.log("идентификатор оператора", selectedOperatorId);
    const columns = useRef<GridColDef[]>([]);
    const [doers, setDoers] = useState<DoerType[]>([]);
    const [operatorsLoaded, setOperatorsLoaded] = useState(false);
    const [rawPrograms, setRawPrograms] = useState<ProgramType[] | null>(null);
    const [showTable, setShowTable] = useState(false);
    const headers = useRef<Record<string, string>>({});

    const load = async () => {
        const response = await getDoers();
        if (response) {
            setDoers(response.sort((a, b) => a.fio_doer.localeCompare(b.fio_doer)));
            //определяем опцию по умолчанию в выпадающем списке операторов
            const userOperator = response.find((item) => item.user_id === currentUser.id);
            setSelectedOperatorId(userOperator ? userOperator.id : response[0].id);
            setOperatorsLoaded(true);
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
            setRawPrograms(data.data.sort((a, b) => a.id - b.id));
            headers.current = data.headers;
        }
    };

    const createColumns = () => {
        const clmns: GridColDef[] = columnFields.map((columnname) => {
            let col: GridColDef = {
                field: columnname,
                headerName: headers.current[columnname],
                flex: 1,
            };
            if (columnname == "ProgramName") {
                col = {
                    ...col,
                    renderCell: (params) => (
                        <MuiLink
                            component={Link}
                            state={{ program: params.row }}
                            to={`/operator/${params.row.ProgramName}`}
                        >
                            {params.row.ProgramName}
                        </MuiLink>
                    ),
                };
            }
            if (["wo_numbers", "wo_data1"].includes(columnname)) {
                colTemplate = {
                    ...colTemplate,
                    valueGetter: (value) => value.join(", "),
                };
            }
            if (columnname == "fio_doer") {
                col = {
                    ...col,
                    valueGetter: (value) => value.fio_doer,
                };
            }

            return col;
        });
        clmns.push({
            field: "action",
            headerName: "Действия",
            flex: 0,
            width: 180,
            renderCell: (params) => {
                switch (params.row.program_status) {
                    case "распределена":
                        return (
                            <Button sx={{ my: 0.5 }} variant="contained" onClick={() => changeProgramStatus(params.id)}>
                                в работу
                            </Button>
                        );
                    case "в работе":
                        return (
                            <Button  sx={{ my: 0.5 }} variant="contained" onClick={() => changeProgramStatus(params.id, "распределена")}>
                                остановить
                            </Button>
                        );
                    default:
                        return <p></p>;
                }
            },
        });
        return clmns;
    };

    const changeProgramStatus = async (rowId: number, new_status?: string) => {
        const result = await OperatorStartProgram(rowId, new_status);
        if (result?.msg) {
            console.log(result);
            if (selectedOperatorId) {
                loadPrograms(selectedOperatorId);
                setShowTable(true);
            }
        }
    };

    useEffect(() => {
        if (rawPrograms !== null) {
            columns.current = createColumns();
            setShowTable(true);
        }
    }, [rawPrograms]);

    useEffect(() => {
        if (operatorsLoaded) {
            loadPrograms(selectedOperatorId);
        }
    }, [selectedOperatorId, operatorsLoaded]);

    const hadleSelectDoer = (event) => {
        console.log("выбрали работника:", event.target.value);
        const selectedDoer = doers.filter((item) => item.id == event.target.value)[0];
        // даем изменить значение селекта тольо если юзер не является оператором
        if (!doers.find((item) => item.user_id === currentUser.id)) setSelectedOperatorId(selectedDoer.id);
    };

    return (
        <>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 1 }}>
                <Typography variant="h5">Рабочее место оператора</Typography>
                {operatorsLoaded && (
                    <>
                        <FormControl sx={{ m: 1, width: 300 }} size="small" >
                            <InputLabel id="master-program-doers">Оператор</InputLabel>
                            <Select
                                labelId="master-program-doers"
                                input={<OutlinedInput label="Оператор" />}
                                onChange={hadleSelectDoer}
                                value={selectedOperatorId}
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
                    <div style={{ height: 700, width: "100%" }}>
                        < DataGrid //StyledDataGrid
                            rows={rawPrograms}
                            columns={columns.current}
                            slots={{ toolbar: CustomToolbar }}
                            initialState={hiddenIdColumn}
                            getRowHeight={() => "auto"}
                        />
                    </div>
                )}
            </Box>
        </>
    );
};

export default Operator;
