import { Link } from "react-router-dom";
import { TechProgramType} from "../../pages/Techman/Techman.types";
import { handleSelectType } from "../../pages/Techman/Techman.types";

const TableRow = ({ data, handleSelect }: { data: TechProgramType; handleSelect: handleSelectType }) => {
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
