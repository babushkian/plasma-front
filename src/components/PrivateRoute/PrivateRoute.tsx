import { useContext, ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { UserContext } from "../../context.tsx";
import { isEndpointPermitted, getDefaultPage } from "../../utils/authorization.ts";

const PrivateRoute = ({ children }: { children: ReactNode }) => {
    const user = useContext(UserContext);
    const { pathname } = useLocation();
    return isEndpointPermitted(user?.currentUser, pathname) ? children : <Navigate to={getDefaultPage(user?.currentUser)} />;
};

export default PrivateRoute;
