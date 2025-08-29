import { useCallback, useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import RecivedMSG from "./Message/RecivedMSG";
import SendMSG from "./Message/SendMSG";
import api from "../../utils/API";

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; name: string; phone: string };
  receiver?: { _id: string; name: string; phone: string };
  createdAt: string;
}

interface ChatResponse {
  chatInfo: string;
  messages: Message[];
  type: string;
  totalMessages: number;
}

const Chat = () => {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "direct";

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const getChatMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const { data } = await api.get<ChatResponse>(`/chat/${chatId}?type=${type}`);
      setMessages(data.messages);
    } catch (err) {
      console.error("Failed to fetch chat messages", err);
    } finally {
      setLoading(false);
    }
  }, [chatId, type]);

  useEffect(() => {
    getChatMessages();
  }, [getChatMessages]);

  if (loading) {
    return <p className="p-4">Loading chat...</p>;
  }

  return (
    <div className="flex-1 relative">
      <header className="bg-indigo-600 p-4 text-white">
        <h1 className="text-2xl font-semibold">Chat</h1>
      </header>

      <div className="h-screen overflow-y-auto p-4 pb-36">
        {messages.map((msg) =>
          msg.sender._id === "CURRENT_USER_ID" ? ( // 👈 هنا بدلها باليوزر اللي عامل لوجين (من الـ context عندك)
            <SendMSG key={msg._id} content={msg.content} />
          ) : (
            <RecivedMSG key={msg._id} content={msg.content} sender={msg.sender.name} />
          )
        )}
      </div>

      <footer className="bg-white border-t border-gray-300 p-4 sticky bottom-0 w-full">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Type a message..."
            className="w-full p-2 rounded-md border border-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button className="bg-indigo-500 text-white px-4 py-2 rounded-md ml-2">Send</button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
