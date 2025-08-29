import { useEffect, useState, useCallback } from "react";
import api from "../../utils/API";
import { NavLink } from "react-router-dom";

interface Friend {
  _id: string;
  name: string;
  phone: string;
}

interface FriendsResponse {
  friends: Friend[];
}

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);

  const getFriends = useCallback(async () => {
    try {
      const { data } = await api.get<FriendsResponse>("/friends");
      setFriends(data.friends);
    } catch (err) {
      console.error("Failed to fetch friends", err);
    }
  }, []); 

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="overflow-y-auto flex-1">
        {friends.map((friend) => (
          <NavLink
            to={`/chat/${friend._id}`}
            key={friend._id}
            className={({ isActive }) => 
              `block hover:bg-gray-50 transition-colors ${
                isActive ? 'bg-green-50 border-r-4 border-green-500' : ''
              }`
            }
          >
            <div className="flex items-center p-4 border-b border-gray-100">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-3 overflow-hidden">
                <img
                  src={`https://avatar.iran.liara.run/username?username=${friend.name}`}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 truncate">{friend.name}</h3>
                <p className="text-sm text-gray-500 truncate">{friend.phone}</p>
              </div>
              <div className="text-xs text-gray-400">
                Online
              </div>
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
