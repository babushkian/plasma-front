import React, { useContext } from "react";
import styles from "./NavBar.module.css";
import dayjs from "dayjs";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@mui/material";
import LogoutButton from "../../components/LogoutButton/LogoutButton"
import { UserContext } from "../../context";



const Navbar: React.FC = () => {
    const { currentUser } = useContext(UserContext);
    const {pathname} = useLocation()
    console.log("----------------------")
    console.log("сейчас мы здесь", location)
    const login = (
        <>
            <Link className={styles["login-container"]} to="/login">
                <Button size="small" variant="contained">
                    войти
                </Button>
            </Link>
        </>
    );
    const logout = (
        <>
            <span>
                {currentUser?.last_name} | {currentUser?.role}
            </span>
            <LogoutButton />
        </>
    );
    const authIidget = !currentUser? pathname==="/login"? <></>:login : logout 

    return (
        <>
            <nav>
                <ul className={styles.navbar}>
                    <li>
                        <NavLink
                            className={({ isActive }) => {
                                return [styles.navlink, isActive ? styles.active : ""].join(" ");
                            }}
                            to="/"
                        >
                            Технолог
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            className={({ isActive }) => {
                                return [styles.navlink, isActive ? styles.active : ""].join(" ");
                            }}
                            to="/master"
                        >
                            Мастер
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            className={({ isActive }) => {
                                return [styles.navlink, isActive ? styles.active : ""].join(" ");
                            }}
                            to="/operator"
                        >
                            Оператор
                        </NavLink>
                    </li>
                    <li>
                        <NavLink
                            className={({ isActive }) => {
                                return [styles.navlink, isActive ? styles.active : ""].join(" ");
                            }}
                            to="/logist"
                        >
                            Логист
                        </NavLink>
                    </li>

                    <li>{authIidget}</li>

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/test">Пример дизайна</NavLink>
                </li> */}

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/loadbystatus">Загрузка по статусу</NavLink>
                </li> */}
                </ul>
            </nav>

                        <Outlet />

        </>
    );
};

export default Navbar;
