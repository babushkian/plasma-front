import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";

import "./index.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import LogistTable from "./pages/LogistTable/LogistTable.tsx";
import Navbar from "./layouts/NavBar/NavBar.tsx";
import Techman from "./pages/Techman/Techman.tsx";
import Details from "./pages/Details/Details.tsx";
import Login from "./pages/Login/Login";
import PartsByStatuses from "./pages/PartsByStatuses/PartsByStatuses.tsx";
import TestLayout from "./pages/TestLayout/TestLayout.tsx";
import Operator from "./pages/Operator/Operator.tsx";

import { BASE_URL, URL_GET_PROGRAM_PARTS } from "./utils/urls";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { getProgramsAndDoers } from "./utils/requests.ts";
import { createTheme, ThemeProvider } from "@mui/material/styles";
//локализация
import { ruRU } from "@mui/x-data-grid/locales";
import { ruRU as coreruRU } from "@mui/material/locale";
import { ruRU as dateruRU } from "@mui/x-date-pickers/locales";

const theme = createTheme(
    {},
    ruRU, // x-data-grid translations
    coreruRU, // core translations
    dateruRU // date-pickers
);

const LazyMaster = lazy(() => import("./pages/Master/Master"));
const LazyLogist = lazy(() => import("./pages/Logist/Logist"));


export const ErrorPage = () => <div className="errormessage">Не удалось загрузить страницу</div>;
export const LoadingPlaceholder = () => <div>Загрузка...</div>;

const router = createBrowserRouter(
    [
        {
            path: "/",
            element: <Navbar />,
            children: [
                { path: "/test", element: <TestLayout /> },
                { path: "/", element: <Techman /> },
                { path: "/login", element: <Login /> },
                {
                    path: "/program/:programName",
                    element: <Details />,
                    errorElement: <ErrorPage />,
                    loader: async ({ params }) => {
                        const path = `${BASE_URL}/${URL_GET_PROGRAM_PARTS}/${params.programName}`;
                        console.log(path);
                        const { data } = await axios.get(path);
                        return data;
                    },
                },

                {
                    path: "/logist",
                    element: (
                        <Suspense fallback={<LoadingPlaceholder />}>
                            <LazyLogist />
                        </Suspense>
                    ),
                    errorElement: <ErrorPage />,
                },
                { path: "/logist/:programName", element: <LogistTable />, errorElement: <ErrorPage /> },

                {
                    path: "/master",
                    element: (
                        <Suspense fallback={<LoadingPlaceholder />}>
                            <LazyMaster />
                        </Suspense>
                    ),
                    loader: getProgramsAndDoers,
                    errorElement: <ErrorPage />,
                },
                {
                    path: "/loadbystatus",
                    element: <PartsByStatuses />,

                    errorElement: <ErrorPage />,
                },
                { path: "/operator", element: <Operator /> },
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
                <RouterProvider router={router} future={{ v7_startTransition: true }} />
            </ThemeProvider>
        </Provider>
    </StrictMode>
);
