import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import axios from "axios";

import './index.css'
// import App from './App.tsx'
import Login from "./pages/Login/Login";
import MainScreen from "./pages/MainScreen/MainScreen";
import Details from "./pages/Details/Details.tsx";
import Navbar from "./layouts/NavBar/NavBar.tsx";
import {BASE_URL, URL_GET_PROGRAM_PARTS} from "./utils/urls"


const router = createBrowserRouter([

    { path: "/", element: <Navbar />, children: [
      { path: "/", element: <MainScreen /> },
      { path: "/login", element: <Login /> },
      { path: "/details", element: <Details /> },
      { path: "/program/:programName", 
        element: <Details />, 
        errorElement: <div className='errormessage'>Страница не найдена</div>,
        loader: async ({params}) => {
          console.log(params)
          console.log(params.programName)
          const path = `${BASE_URL}/${URL_GET_PROGRAM_PARTS}${params.programName}`;
          console.log(path)
          const {data} = await axios.get(path)
          console.log(data)
          return data
        }
      },

 ] },
    
    
]);


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}></RouterProvider>
    
  </StrictMode>,
)
