import { createRoot } from 'react-dom/client'
import './index.css'
import { Engine } from './pages/Engine.tsx'
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom"
import Landing from './pages/Landing.tsx'


const router = createBrowserRouter(
    createRoutesFromElements(
        <>
            <Route path='/' element={<Landing />} />
            <Route path='join' element={<Engine />} />
            <Route path="*" element={<Landing/>} />

        </>
    )
)
createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
    // <App />

)
