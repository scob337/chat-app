import { useState } from "react"
import FriendsList from "./FriendsList"
import ChatsList from "./ChatsList"

import { IoHome, IoPerson, IoChatbubbles } from "react-icons/io5";
import { FaUserGroup } from "react-icons/fa6";
import { IoIosSettings } from "react-icons/io";
import { FaSignOutAlt } from "react-icons/fa";

const Aside = () => {
  const [activeSection, setActiveSection] = useState('chats')
  const [isExpanded, setIsExpanded] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  const renderContent = () => {
    switch(activeSection) {
      case 'chats':
        return <ChatsList />
      case 'friends':
        return <FriendsList />
      case 'groups':
        return <p>Coming soon..</p>
      case 'settings':
        return <p>Coming soon..</p>
              default:
        return <ChatsList />
    }
  }

  return (
    <div className={`bg-white border-r border-gray-200 h-screen flex ${isExpanded ? 'w-80' : 'w-16'} transition-all duration-300`}>
      {/* Navigation Sidebar */}
      <div className="w-16 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200">
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <IoHome className="text-xl text-gray-600" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4">
          <ul className="space-y-2 px-2">
            <li>
              <button
                onClick={() => setActiveSection('chats')}
                className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
                  activeSection === 'chats' 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Chats"
              >
                <IoChatbubbles className="text-xl" />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('friends')}
                className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
                  activeSection === 'friends' 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Friends"
              >
                <IoPerson className="text-xl" />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('groups')}
                className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
                  activeSection === 'groups' 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Groups"
              >
                <FaUserGroup className="text-xl" />
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection('settings')}
                className={`w-full p-3 rounded-lg transition-colors flex items-center justify-center ${
                  activeSection === 'settings' 
                    ? 'bg-green-100 text-green-600' 
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
                title="Settings"
              >
                <IoIosSettings className="text-xl" />
              </button>
            </li>
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center justify-center"
            title="Logout"
          >
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {isExpanded && (
        <div className="flex-1 flex flex-col">
          {/* Section Header */}
          <div className="h-16 bg-gray-50 border-b border-gray-200 flex items-center px-4">
            <h2 className="text-lg font-semibold text-gray-800 capitalize">
              {activeSection}
            </h2>
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      )}
    </div>
  )
}

export default Aside
