import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import LogistTable from "./pages/LogistTable/LogistTable.tsx";
import Navbar from "./layouts/NavBar/NavBar.tsx";
import Techman from "./pages/Techman/Techman.tsx";
import Login from "./pages/Login/Login";
import PartsByStatuses from "./pages/PartsByStatuses/PartsByStatuses.tsx";
import Operator from "./pages/Operator/Operator.tsx";
import OperatorParts from "./pages/Operator/OperatorParts.tsx";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.tsx";

import { BASE_URL, URL_GET_PROGRAM_PARTS } from "./utils/urls";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from '@mui/material/CssBaseline';
//локализация
import { ruRU } from "@mui/x-data-grid/locales";
import { ruRU as coreruRU } from "@mui/material/locale";
import { ruRU as dateruRU } from "@mui/x-date-pickers/locales";
import PartsList from "./pages/PartsList/PartsList.tsx";
import Master from "./pages/Master/Master.tsx";
import MasterContext from "./context.tsx";



// const theme = createTheme({
//     palette: {
//         primary: {
//             main: "#1976d2", // Основной цвет для primary
//         },
//         secondary: {
//             main: "#dc004e", // Основной цвет для secondary
//         },
//         background: {
//             default: "#1e1a15",
//             paper: "#836c6c",
//         },
//         text: {
//             primary: 'rgba(255,255,255,0.87)',
//             secondary: 'rgba(218,211,208,0.6)',
//           },

//     },
// });

const theme = createTheme( {},
    ruRU, // x-data-grid translations
    coreruRU, // core translations
    dateruRU // date-pickers
);

const LazyLogist = lazy(() => import("./pages/Logist/Logist"));

export const ErrorPage = () => <div className="errormessage">Не удалось загрузить страницу</div>;
export const LoadingPlaceholder = () => <div>Загрузка...</div>;

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Navbar />,
            children: [
                {
                    path: "/",
                    element: (
                        <PrivateRoute>
                            <Techman />
                        </PrivateRoute>
                    ),
                },
                { path: "/login", element: <Login /> },
                {
                    path: "/logist",
                    element: (
                        <PrivateRoute>
                            <Suspense fallback={<LoadingPlaceholder />}>
                                <LazyLogist />
                            </Suspense>
                        </PrivateRoute>
                    ),
                    errorElement: <ErrorPage />,
                },
                { path: "/logist/:programName", element: <LogistTable />, errorElement: <ErrorPage /> },

                {
                    path: "/master",
                    element: (
                        <PrivateRoute>
                            <Master />
                        </PrivateRoute>
                    ),
                    errorElement: <ErrorPage />,
                },
                {
                    path: "/loadbystatus",
                    element: <PartsByStatuses />,

                    errorElement: <ErrorPage />,
                },
                {
                    path: "/operator",
                    element: (
                        <PrivateRoute>
                            <Operator />
                        </PrivateRoute>
                    ),
                },
                { path: "/operator/:programName", element: <OperatorParts /> },
                { path: "/parts/:programName", element: <PartsList />, errorElement: <ErrorPage /> },
            ],
        },
    ],
    {
        future: {
            v7_relativeSplatPath: true,
        },
    }
);

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
