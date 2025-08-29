import { Outlet, useNavigate } from 'react-router-dom'
import Aside from '../Components/Aside/Aside'
import { useEffect } from 'react';

const ChatLayout = () => {
const navigate = useNavigate();

useEffect(() => {
      const user = localStorage.getItem("user")

    if (!user) {
        navigate('/login');
    }
}, [navigate]);

  return (
    <div className="flex h-[100vh] overflow-hidden">
    <Aside/>
    <Outlet/>
        </div>
  )
}

export default ChatLayout
