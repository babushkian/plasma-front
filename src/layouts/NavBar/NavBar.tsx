import React, { createContext, useContext, useState } from "react";
import styles from "./NavBar.module.css";
import dayjs from "dayjs";
import { NavLink, Outlet } from "react-router-dom";

import { DateDiapazonType } from "../../pages/Techman/Techman.types";
import { DateDiapazonContext } from "../../context";

const defaultDates: DateDiapazonType = {
    startDate: dayjs().subtract(7, "day"),
    endDate: dayjs(),
};



const Navbar: React.FC = () => {    
    const [dateDiapazon, setDateDiapazon] = useState<DateDiapazonType>(defaultDates)
    return (
        <>  <DateDiapazonContext.Provider value={{dateDiapazon, setDateDiapazon}} >
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

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/login">Логин</NavLink>
                </li> */}

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/test">Пример дизайна</NavLink>
                </li> */}

                    {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/loadbystatus">Загрузка по статусу</NavLink>
                </li> */}
                </ul>
            </nav>
            <Outlet />
            </DateDiapazonContext.Provider>
        </>
    );
};

export default Navbar;
