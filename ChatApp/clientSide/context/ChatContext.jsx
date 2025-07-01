import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { data } from "react-router-dom";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const { socket, axios } = useContext(AuthContext);

  //function to get all users for sidebar
  const getUsers = async () => {
    try {
      const { data } = await axios.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to get messages for a selected user
  const getMessages = async (userId) => {
    try {
      const { data } = await axios.get(`/api/messages/${userId}`);
      if (data.success) {
        setMessages(data.messages);

        // Mark messages as seen on server
        await axios.put(`/api/messages/mark/${userId}`);

        // Clear unseen message count locally
        setUnseenMessages((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to send message to selected user
  const sendMessage = async (messageData) => {
    // console.log('messageData',messageData);
    // if (!selectedUser || !selectedUser._id) {
    //   toast.error("No user selected");
    //   return;
    // }

    // try {
    //   const { data } = await axios.post(
    //     `/api/messages/send/${selectedUser._id}`,
    //     messageData
    //   );
    //   if (data.success) {
    //     setMessages((prevMessages) => [...prevMessages, data.newMessage]);
    //   } else {
    //     toast.error(data.message);
    //   }
    // } catch (error) {
    //   toast.error(error.message);
    // }
    try {
      const { data } = await axios.post(
        `/api/messages/send/${selectedUser._id}`,
        messageData
      );
      if (data.success) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage]);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  //function to subscribe to messages for selected user
  const subscribeToMessages = async () => {
    if (!socket) return;
    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`); // correct
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: prev[newMessage.senderId]
            ? prev[newMessage.senderId] + 1
            : 1
        }));
      }
    });
  };

  //function to  unsubscribe from messages
  const unsubscribeFromMessages = () => {
    if (socket) socket.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    getUsers,
    getMessages,
    setMessages,
    sendMessage,
    setSelectedUser,
    setUnseenMessages
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
