import bgImage from "../../assets/about-bg.jpg"
import React, { useContext } from "react";
import styles from "./NavBar.module.css";
import dayjs from "dayjs";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Box, Button } from "@mui/material";
import LogoutButton from "../../components/LogoutButton/LogoutButton";
import { UserContext } from "../../context";
import { endpoints, getUserEndpoints } from "../../utils/authorization";

const Navbar: React.FC = () => {
    const { currentUser } = useContext(UserContext);
    const { pathname } = useLocation();
    const login = (
        <>
            <Link className={styles["login-container"]} to={endpoints.LOGIN}>
                <Button size="small" variant="contained">
                    войти
                </Button>
            </Link>
        </>
    );
    const logout = (
        <>
            <span style={{marginRight:10}}>
                {currentUser?.last_name} | {currentUser?.role}
            </span>
            <LogoutButton />
        </>
    );
    const authWidget = !currentUser ? pathname === endpoints.LOGIN ? <></> : login : logout;

    return (
        <>
            <nav>
                <ul className={styles.navbar}>


                    {getUserEndpoints(currentUser).map((item) => (
                        <li key={item.name}>
                            <NavLink
                                className={({ isActive }) => {
                                    return [styles["menu-link"], isActive ? styles.active : ""].join(" ");
                                }}
                                to={item.endpoint}
                            >
                                {item.name}
                            </NavLink>
                        </li>
                    ))}
                    <li style={{flexGrow:1}}></li>
                    <li>{authWidget}</li>

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/loadbystatus">Загрузка по статусу</NavLink>
                </li> */}
                </ul>
            </nav>
            <div className={styles.background}>
            <Outlet/>
            </div>
        </>
    );
};

export default Navbar;
