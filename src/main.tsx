import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import { endpoints } from "./utils/authorization.ts";

import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import { LogistTable } from "./pages/LogistTable/LogistTable.tsx";
import Navbar from "./layouts/NavBar/NavBar.tsx";
import Techman from "./pages/Techman/Techman.tsx";
import Login from "./pages/Login/Login";
import {Operator} from "./pages/Operator/Operator.tsx";
import {OperatorParts} from "./pages/Operator/OperatorParts.tsx";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.tsx";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
//локализация
import { ruRU } from "@mui/x-data-grid/locales";
import { ruRU as coreruRU } from "@mui/material/locale";
import { ruRU as dateruRU } from "@mui/x-date-pickers/locales";
import PartsList from "./pages/PartsList/PartsList.tsx";
import { Master } from "./pages/Master/Master.tsx";
import PlasmaParts from "./pages/Techman/PlasmaParts.tsx";
import MasterContext from "./context.tsx";
import MainReport from "./pages/MainReport/MainReport.tsx";
import RedirectByRole from "./pages/MainPage/MainPage.tsx";
import NotFoundPage from "./pages/NotFoundPage/NotFoundPage.tsx";
import {NewTechman} from "./pages/NewTechman/NewTechman.tsx"

// import NewLogist from "./pages/Logist/Logist.tsx";
// import NewLogistTable from "./pages/Logist/LogistTable.tsx";


const theme = createTheme(
    {
        palette: {
            mode: "dark",
            primary: {
                main: "#e8e8d1",
                contrastText: "#060606",
                //dark: '#15a00f',
                dark: "#357EFF",
                light: "#f3f3d9",
            },
            secondary: {
                main: "#ec562d",
            },
            background: {
                default: "#3D3B38",
                paper: "#4a4747",
            },
            divider: "rgba(212,212,212,0.58)",
            text: {
                secondary: "rgba(209,209,209,0.9)",
                primary: "rgba(255,255,255,0.95)",
                disabled: "rgba(200,200,200,0.45)",
                hint: "#acacb7",
            },
        },
    },
    ruRU, // x-data-grid translations
    coreruRU, // core translations
    dateruRU // date-pickers
);



const LazyLogist = lazy(() => import("./pages/Logist/Logist"));

export const ErrorPage = () => <div className="errormessage">Не удалось загрузить страницу</div>;
export const LoadingPlaceholder = () => <div>Загрузка...</div>;

const router = createBrowserRouter(
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
                { path: "t", element: <NewTechman /> },
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
console.log("список маршрутов");
console.log(router.routes);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <MasterContext>
                    <RouterProvider router={router} future={{ v7_startTransition: true }} />
                </MasterContext>
            </ThemeProvider>
        </Provider>
    </StrictMode>
);
