import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { clearStore } from "../../utils/local-storage";
import { useContext } from "react";
import { UserContext } from "../../context.tsx";
import { logout } from "../../utils/requests";

const LogoutButton = () => {
    const navigate = useNavigate();
    const uc = useContext(UserContext);
    if (uc) {
        const { setCurrentUser } = uc;
        const handleLogout = async () => {
            console.log("разлогиниваюсь");
            clearStore();
            // Отправка POST-запроса на сервер с использованием axios
            const response = logout();

            console.log("разлогинились:", response);
            setCurrentUser(undefined);
            navigate("/login");
        };

        return (
            <>
                <Button size="small" variant="contained" onClick={handleLogout}>
                    выйти
                </Button>
            </>
        );
    } else {
        return (
            <>
                <Button size="small" variant="contained">
                    не работает
                </Button>
            </>
        );
    }
};
export default LogoutButton;
