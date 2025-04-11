import { lazy, Suspense} from "react";
import { createBrowserRouter } from "react-router-dom";

import { LogistTable } from "../pages/LogistTable/LogistTable.tsx";
import Navbar from "../layouts/NavBar/NavBar.tsx";
import {Techman} from "../pages/Techman/Techman.tsx";
import Login from "../pages/Login/Login";
import {Operator} from "../pages/Operator/Operator.tsx";
import {OperatorParts} from "../pages/Operator/OperatorParts.tsx";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute.tsx";
import PartsList from "../pages/PartsList/PartsList.tsx";
import { Master } from "../pages/Master/Master.tsx";
import PlasmaParts from "../pages/Techman/PlasmaParts.tsx";
import MainReport from "../pages/MainReport/MainReport.tsx";
import RedirectByRole from "../pages/MainPage/MainPage.tsx";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import { AddOperator } from "../pages/AddOperator/AddOperator.tsx";


import { endpoints } from "../utils/authorization";

const LazyLogist = lazy(() => import("../pages/Logist/Logist"));

const ErrorPage = () => <div className="errormessage">Не удалось загрузить страницу</div>;
const LoadingPlaceholder = () => <div>Загрузка...</div>;

export const router = createBrowserRouter(
    [
        { path: "/", element: <RedirectByRole /> },
        {
            element: <Navbar />,
            children: [
                {
                    Component: PrivateRoute,
                    children: [
                        {
                            path: endpoints.TECHMAN,
                            children: [
                                { index: true, element: <Techman /> },
                                { path: ":programName", Component: PlasmaParts, errorElement: <ErrorPage /> },
                            ],
                        },
                        {
                            path: endpoints.MASTER,
                            children: [
                                { index: true, Component: Master, errorElement: <ErrorPage /> },
                                { path: ":programName", Component: PartsList, errorElement: <ErrorPage /> },
                            ],
                        },
                        {path: endpoints.ADD_OPERATOR, Component: AddOperator},
                        {
                            path: endpoints.OPERATOR,
                            children: [
                                { index: true, element: <Operator /> },
                                { path: ":programName", element: <OperatorParts /> },
                            ],
                        },
                        {
                            path: endpoints.LOGIST,
                            children: [
                                {
                                    index: true,
                                    element: (
                                        <Suspense fallback={<LoadingPlaceholder />}>
                                            <LazyLogist />
                                        </Suspense>
                                    ),
                                    errorElement: <ErrorPage />,
                                },
                                { path: ":programName", Component: LogistTable, errorElement: <ErrorPage /> },
                            ],
                        },
                    ],
                },
                { path: endpoints.LOGIN, element: <Login /> },
                { path: endpoints.MAIN_REPORT, Component: MainReport, errorElement: <ErrorPage /> },
                { path: "*", element: <NotFoundPage /> },
            ],
        },
    ],
    {
        future: {
            v7_relativeSplatPath: true,
        },
    }
);