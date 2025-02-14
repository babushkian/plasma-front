import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";

import "./index.css";
// import App from './App.tsx'
import Navbar from "./layouts/NavBar/NavBar.tsx";
import MainScreen from "./pages/MainScreen/MainScreen";
import Details from "./pages/Details/Details.tsx";
import Login from "./pages/Login/Login";

import { BASE_URL, URL_GET_PROGRAM_PARTS } from "./utils/urls";

import { Provider } from "react-redux";
import { store } from "./store/store.ts";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navbar />,
        children: [
            { path: "/", element: <MainScreen /> },
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
