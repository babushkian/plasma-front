import { StrictMode, lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";

import "./index.css";

import Navbar from "./layouts/NavBar/NavBar.tsx";
import Techman from "./pages/Techman/Techman.tsx";
import Details from "./pages/Details/Details.tsx";
import Login from "./pages/Login/Login";

import { BASE_URL, URL_GET_PROGRAM_PARTS } from "./utils/urls";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";
import { getProgramsAndDoers } from "./utils/requests.ts";

const LazyMaster = lazy(() => import("./pages/Master/Master"));
const LazyLogist = lazy(() => import("./pages/Logist/Logist"));

const ErrorPage = () => <div className="errormessage">Не удалось загрузить страницу</div>;
const LoadingPlaceholder = () => <div>Загрузка...</div>;

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navbar />,
        children: [
            { path: "/", element: <Techman /> },
            { path: "/login", element: <Login /> },
            {
                path: "/program/:programName",
                element: <Details />,
                errorElement: <div className="errormessage">Страница не найдена</div>,
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
        ],
    },
]);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    </StrictMode>
);
