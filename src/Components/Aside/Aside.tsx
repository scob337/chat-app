import { useState } from "react"
import FriendsList from "./FriendsList"
import TopBar from "./TopBar"
import { IoHome,IoPerson  } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";

const Aside = () => {
  const [ToggleSide, setToggleSide] = useState(true)
  return (
    <div className={` border-r h-[100vh] sticky top-0  ${ToggleSide ? 'w-100' : 'w-10'} transition-width duration-300 flex flex-col`}>
      <TopBar SetToggle={setToggleSide} isToggle={ToggleSide} />
      <div className="flex  gap-1 w-[100%]" >
<div className="icon h-[100vh] bg-white w-10">
          <ul 
        className={`flex flex-col  m-auto
        justify-around p-1 items-center  h-[90%] ${!ToggleSide && "w-9 gap-10 h-[90%]"}`}>

          <li className={`${!ToggleSide? "text-[20px]" : "text-[26px]"} cursor-pointer`} title="Home">
            <IoHome />
          </li>
          <li className={`${!ToggleSide? "text-[20px]" : "text-[26px]"} cursor-pointer`} title="Friends">
            <IoPerson />
          </li>
                    <li className={`${!ToggleSide? "text-[20px]" : "text-[26px]"} cursor-pointer`} title="Groups">
            <FaUserGroup />
          </li>
          <li className={`${!ToggleSide? "text-[20px]" : "text-[26px]"} cursor-pointer`} title="Setting">
            <IoIosSettings />
          </li>
          <li className={`${!ToggleSide? "text-[20px]" : "text-[26px]"} cursor-pointer`} title="Log Out">
            <FaSignOutAlt />
          </li>
        </ul>
</div>
        {ToggleSide && <FriendsList />}
      </div>

    </div>
  )
}

export default Aside
