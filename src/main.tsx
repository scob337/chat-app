import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext.tsx'
import LoginPage from './Pages/Login.tsx'
import ChatLayout from './Layouts/ChatLayout.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Chat from './Components/Chat/Chat.tsx'


const Router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ChatLayout />,
    children: [
      {
        index: true, // الصفحة الرئيسية جوه ChatLayout
        element: <img
        src='https://ai.updf.com/images/web/chat-image-01-img.png'
        alt='chat'
        className='w-[100vw] h-full object-contain'
      />,
      },
      {
        path: "chat/:chatId", // 👈 هنا عملنا param ديناميك
        element: <Chat />,
      },
    ],
  },
]);


createRoot(document.getElementById('root')!).render(

  <StrictMode>
     <AuthProvider>
      <RouterProvider router={Router} />
    </AuthProvider>
  </StrictMode>
)
