import { useContext } from "react";
import { Navigate, useLocation, Outlet} from "react-router-dom";
import { UserContext } from "../../context.tsx";
import { isEndpointPermitted, getDefaultPage } from "../../utils/authorization.ts";

const PrivateRoute = () => {
    const user = useContext(UserContext);
    const { pathname } = useLocation();
    return isEndpointPermitted(user?.currentUser, pathname) ? <Outlet /> : <Navigate to={getDefaultPage(user?.currentUser)} />;
    
};


export default PrivateRoute;
