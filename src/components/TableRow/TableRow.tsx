import { Link } from "react-router-dom";
import { PrognameType, ProgramStatus } from "../../pages/MainScreen/MainScreen.types";
import { handleCreateDataType } from "../../pages/MainScreen/MainScreen.types";

const actionmap: Record<ProgramStatus, string> = {
    [ProgramStatus.NEW]: "создать",
    [ProgramStatus.CREATED]: "изменить",
};

const TableRow = ({ data, handleCreateData }: { data: PrognameType; handleCreateData: handleCreateDataType }) => {
    return (
        <tr>
            <td>
                <Link to={`/program/${data.ProgramName}`}> {data.ProgramName} </Link>
            </td>
            <td>{data.program_status}</td>
            <td>{data.PostDateTime}</td>
            <td>{data.Material}</td>
            <td>
                <button
                    onClick={() =>
                        handleCreateData({ program_status: data.program_status, ProgramName: data.ProgramName })
                    }
                >
                    {actionmap[data.program_status]}
                </button>
            </td>
        </tr>
    );
};

export default TableRow;
