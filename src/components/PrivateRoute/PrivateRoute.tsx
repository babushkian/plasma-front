import { useContext, ReactNode} from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from '../../context.tsx';


const PrivateRoute = ({children}:{children: ReactNode} ) => {
    const user = useContext(UserContext)
    return user?.currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
