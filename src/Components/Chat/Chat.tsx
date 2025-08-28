import RecivedMSG from "./Message/RecivedMSG"
import SendMSG from "./Message/SendMSG"

const Chat = () => {
  return (
        <div className="flex-1 relative" >
            <header className="bg-indigo-600 p-4.5 text-white">
                <h1 className="text-2xl font-semibold">Alice</h1>
            </header>
            
            <div className="h-screen overflow-y-auto p-4 pb-36">
                <RecivedMSG/>
                <SendMSG/>
            </div>
                           <footer className="bg-white border-t border-gray-300 p-4 sticky bottom-0 w-full">
                <div className="flex items-center">
                    <input type="text" placeholder="Type a message..." className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"/>
                    <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2">Send</button>
                </div>
            </footer>
            </div>
  )
}

export default Chat
