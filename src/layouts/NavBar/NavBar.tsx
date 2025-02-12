import React from "react";
import styles from "./NavBar.module.css"

import { Link, Outlet } from "react-router-dom";

const Navbar: React.FC = () => {

    return (
        <>
        <nav>
            <ul className={styles.navbar}>
                <li>
                    <Link className={styles.navlink} to="/">Главный экран</Link>
                </li>
                <li>
                    <Link className={styles.navlink} to="/login">Логин</Link>
                </li>
                <li>
                    <Link className={styles.navlink} to="/details">Детали задания</Link>
                </li>

            </ul>
        </nav>
        <Outlet/>
        </>
    );
};

export default Navbar;
