import { useEffect, useState } from "react";
import api from "../../utils/API";

interface Friend {
  id: string;
  name: string;
  phone: string;
}

interface FriendsResponse {
  friends: Friend[];
}

const FriendsList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    const getFriends = async () => {
      try {
        const { data } = await api.get<FriendsResponse>("/friends");
        setFriends(data.friends);
      } catch (err) {
        console.error("Failed to fetch friends", err);
      }
    };
    getFriends();
  }, []);

  return (
    <div className="flex flex-col bg-white w-[100%]">
      <div className="overflow-y-auto h-[90vh] p-3 mb-9 pb-20 w-full">
        {friends.map((friend) => (
          <div
            key={friend.phone}
            className="flex items-center mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded-md w-full"
          >
            <div className="w-12 h-12 bg-gray-300 rounded-full mr-3">
              <img
                src={`https://avatar.iran.liara.run/username?username=${friend.name}`}
                alt="User Avatar"
                className="w-12 h-12 rounded-full"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{friend.name}</h2>
              <p className="text-gray-600">{friend.phone}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FriendsList;
