import { useCallback, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import RecivedMSG from "./Message/RecivedMSG";
import SendMSG from "./Message/SendMSG";
import EmojiPicker from "./EmojiPicker";
import api from "../../utils/API";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; name: string; phone: string };
  receiver?: { _id: string; name: string; phone: string };
  createdAt: string;
}

interface ChatInfo {
  _id: string;
  name: string;
  phone: string;
  lastSeen?: string;
}

interface ChatResponse {
  chatInfo: ChatInfo;
  messages: Message[];
  type: string;
  totalMessages: number;
}

const Chat = () => {
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type") || "direct";
  const { user } = useAuth();
  const { socket, isConnected, joinRoom, sendMessage: socketSendMessage } = useSocket();

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getChatMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      setLoading(true);
      const { data } = await api.get<ChatResponse>(`/chat/${chatId}?type=${type}`);
      setMessages(data.messages || []);
      setChatInfo(data.chatInfo);
    } catch (err) {
      console.error("Failed to fetch chat messages", err);
    } finally {
      setLoading(false);
    }
  }, [chatId, type]);

  // استماع للرسائل الجديدة مع تحسينات
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      console.log('📨 New message received in Chat:', data);
      
      if (data.message && data.message._id) {
        setMessages(prevMessages => {
          // التأكد من عدم تكرار الرسالة
          const messageExists = prevMessages.some(msg => msg._id === data.message._id);
          if (!messageExists) {
            console.log('✅ Adding new message to chat');
            return [...prevMessages, data.message];
          }
          console.log('⚠️ Message already exists, skipping');
          return prevMessages;
        });
      }
    };

    socket.on('receive_message', handleNewMessage);

    return () => {
      socket.off('receive_message', handleNewMessage);
    };
  }, [socket]);

  // إرسال الرسائل مع تحسينات
  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId || !user || sending) return;

    try {
      setSending(true);
      
      const payload = {
        content: newMessage.trim(),
        type: 'text',
        ...(type === 'direct' ? { receiverId: chatId } : { groupId: chatId })
      };
      
      console.log('📤 Sending message:', payload);
      
      const response = await api.post('/chat/send', payload);
      
      // إضافة الرسالة مباشرة للـ state
      if (response.data && response.data.message) {
        setMessages(prevMessages => {
          const messageExists = prevMessages.some(msg => msg._id === response.data.message._id);
          if (!messageExists) {
            return [...prevMessages, response.data.message];
          }
          return prevMessages;
        });
      }
      
      // إرسال عبر Socket للـ real-time
      if (socket && isConnected) {
        socketSendMessage(chatId, newMessage.trim(), type === 'direct' ? chatId : undefined);
      }
      
      setNewMessage("");
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // انضمام للغرفة عند تحميل المحادثة
  useEffect(() => {
    if (chatId && socket && isConnected) {
      console.log('🏠 Joining room:', chatId);
      joinRoom(chatId);
    }
  }, [chatId, socket, isConnected, joinRoom]);

  useEffect(() => {
    getChatMessages();
  }, [getChatMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* WhatsApp-like Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
          <img
            src={`https://avatar.iran.liara.run/username?username=${chatInfo?.name || 'User'}`}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h1 className="text-lg font-medium text-gray-900">
            {chatInfo ? chatInfo.name : (type === 'direct' ? 'Direct Chat' : 'Group Chat')}
          </h1>
          {chatInfo && chatInfo.phone && (
            <p className="text-sm text-gray-500">
              {chatInfo.phone}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm text-gray-500">
            {isConnected ? 'Online' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.1'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E')"}}>
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-4xl mb-4">💬</div>
            <p className="text-lg font-medium">No messages yet</p>
            <p className="text-sm">Start a new conversation!</p>
          </div>
        ) : (
          messages
            .filter(msg => msg && msg.sender && msg._id)
            .map((msg) => {
              const isMyMessage = msg.sender?._id === user?.id;
              return isMyMessage ? (
                <SendMSG key={msg._id} content={msg.content || ''} />
              ) : (
                <RecivedMSG 
                  key={msg._id} 
                  content={msg.content || ''} 
                  sender={msg.sender?.name || 'Unknown User'} 
                />
              );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <footer className="bg-white border-t border-gray-200 p-4 relative">
        <EmojiPicker 
          isOpen={showEmojiPicker}
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            disabled={!isConnected}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd"></path>
            </svg>
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={sending || !isConnected}
              className="w-full p-3 pr-12 rounded-full border border-gray-300 focus:outline-none focus:border-green-500 disabled:opacity-50 transition-colors bg-gray-50"
            />
          </div>
          <button 
            onClick={sendMessage}
            disabled={sending || !newMessage.trim() || !isConnected}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
              </svg>
            )}
          </button>
        </div>
      </footer>
    </div>
  );
};

export default Chat;
