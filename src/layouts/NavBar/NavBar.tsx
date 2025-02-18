import React from "react";
import styles from "./NavBar.module.css"

import { Link, Outlet } from "react-router-dom";

const Navbar: React.FC = () => {

    return (
        <>
        <nav>
            <ul className={styles.navbar}>
                <li>
                    <Link className={styles.navlink} to="/">Техник</Link>
                </li>
                <li>
                    <Link className={styles.navlink} to="/master">Мастер</Link>
                </li>

                <li>
                    <Link className={styles.navlink} to="/logist">Логист</Link>
                </li>
 
                <li>
                    <Link className={styles.navlink} to="/login">Логин</Link>
                </li>
 
            </ul>
        </nav>
        <Outlet/>
        </>
    );
};

export default Navbar;
