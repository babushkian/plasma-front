import { Link } from "react-router-dom";
import { PrognameType} from "../../pages/MainScreen/MainScreen.types";
import { handleSelectType } from "../../pages/MainScreen/MainScreen.types";

const TableRow = ({ data, handleSelect }: { data: PrognameType; handleSelect: handleSelectType }) => {
    return (
        <tr>
            <td>
                <Link to={`/program/${data.ProgramName}`}> {data.ProgramName} </Link>
            </td>
            <td>{data.program_status}</td>
            <td>{data.PostDateTime}</td>
            <td>{data.Material}</td>
            <td>
                <input
                    type="checkbox"
                    onChange={() =>
                        handleSelect({ program_status: data.program_status, ProgramName: data.ProgramName })
                    }
                />
            </td>
        </tr>
    );
};

export default TableRow;
