
import { Navigate } from "react-router-dom";
import { getDefaultPage } from "../../utils/authorization";
import { useContext } from "react";
import { UserContext } from "../../context";

export const RedirectByRole = () => {
    const user = useContext(UserContext);
    return <Navigate to={getDefaultPage(user?.currentUser)} />;
}

export default RedirectByRole;