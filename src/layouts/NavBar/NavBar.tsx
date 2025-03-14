import React from "react";

import styles from "./NavBar.module.css"

import { NavLink, Outlet} from "react-router-dom";

const Navbar: React.FC = () => {
    return (
        <>
        <nav>
            <ul className={styles.navbar}>
                <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/">Технолог</NavLink>
                </li>
                <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/master">Мастер</NavLink>
                </li>
                <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/simple_master">Простой мастер</NavLink>
                </li>
                {/* <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/simple_master">Продвинутый мастер</NavLink>
                </li> */}


                <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/operator">Оператор</NavLink>
                </li>
                <li>
                    <NavLink className={({isActive}) => {return [styles.navlink, isActive?styles.active : ""].join(" ")}} to="/logist">Логист</NavLink>
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
        <Outlet/>
        </>
    );
};

export default Navbar;
