import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Engine } from './pages/Engine.tsx'
import {Route,RouterProvider, createBrowserRouter, createRoutesFromElements} from "react-router-dom"
import Landing from './pages/Landing.tsx'


const router = createBrowserRouter(
    createRoutesFromElements(
        <>
        <Route path='/' element={<Landing/>}/>
        <Route path='join/:params' element={<Engine/>}/>

       
        </>
    )
)
createRoot(document.getElementById('root')!).render(
<RouterProvider router={router}/>
    // <App />
 
)
