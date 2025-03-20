import React, { useState } from "react";
import styles from "./NavBar.module.css";
import dayjs from "dayjs";
import { NavLink, Outlet } from "react-router-dom";

import { DateDiapazonType } from "../../pages/Techman/Techman.types";
import { DateDiapazonContext, OperatorSelectContext, UserContext } from "../../context";
import { UserType } from "../../pages/Login/Login.types";
import { getUserFromStore } from "../../utils/local-storage";

const defaultDates: DateDiapazonType = {
    startDate: dayjs().subtract(7, "day"),
    endDate: dayjs(),
};

const Navbar: React.FC = () => {
    const [dateDiapazon, setDateDiapazon] = useState<DateDiapazonType>(defaultDates);
    const [currentUserId, setCurrentUserId] = useState<number>(1);
    const [currentUser, setCurrentUser] = useState<UserType | undefined>(getUserFromStore);
    console.log("юзер:", currentUser)
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

                    <li >
                    <span>{currentUser?.last_name}| {currentUser?.role}</span><NavLink className={({isActive}) => {return [styles["login-container"], isActive?styles.active : ""].join(" ")}} to="/login">Логин</NavLink>
                </li>

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/test">Пример дизайна</NavLink>
                </li> */}

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/loadbystatus">Загрузка по статусу</NavLink>
                </li> */}
                </ul>
            </nav>

            <DateDiapazonContext.Provider value={{ dateDiapazon, setDateDiapazon }}>
                <OperatorSelectContext.Provider value={{ currentUserId, setCurrentUserId }}>
                    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
                    <Outlet />
                    </UserContext.Provider>
                </OperatorSelectContext.Provider>
            </DateDiapazonContext.Provider>
            
        </>
    );
};

export default Navbar;
