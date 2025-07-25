  import React, { useContext, useEffect, useRef, useState } from "react";
  import assets, { messagesDummyData } from "../assets/assets";
  import { formatMessageTime } from "../lib/utils";
  import { ChatContext } from "../../context/ChatContext";
  import { AuthContext } from "../../context/AuthContext";
  import toast from "react-hot-toast";

  const ChatContainer = () => {
    const {
      messages,
      selectedUser,
      setSelectedUser,
      sendMessage,
      getMessages,
      setMessages
    } = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);

    const scrollEnd = useRef();
    const [input, setInput] = useState("");

    //Handle sending message
    const handleSendMessage = async (e) => {
      e.preventDefault();
      if(input.trim() === "") return null;
      await sendMessage({text:input.trim()})
      setInput("");
    };

  //Handle when sending Image
  const handleSendImage = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        await sendMessage({ image: reader.result });
      } catch (error) {
        toast.error("Failed to send image");
      } finally {
        e.target.value = ""; // clear the input
      }
    };

    reader.readAsDataURL(file); // ✅ THIS WAS MISSING
  };
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    console.log("🟨 Messages updated:", messages);
  }, [messages]);

  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  console.log("messages", messages);
  return selectedUser ? (
    <div className="h-full flex flex-col backdrop-blur-lg">
      {" "}
      {/* header */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3">
        {" "}
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt=""
          className="w-8 rounded-full"
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id)}
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
        </p>
        <img
          src={assets.arrow_icon}
          alt=""
          onClick={() => setSelectedUser(null)}
          className="md:hidden max-w-7"
        />
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>
      {/* char area  */}
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-3">
        {" "}
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-end gap-2 justify-end ${
              msg.senderId !== authUser._id && "flex-row-reverse"
            }`}>
            {msg.image ? (
              <img
                src={msg.image}
                alt=""
                className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8"
              />
            ) : (
              <p
                className={`p-2 max-w-[200px] md:text-sm font-light rounded-lg mb-8 break=all bg-violet-500/30 text-white ${
                  msg.senderId === authUser._id
                    ? "rounded-br-none"
                    : "rounded-bl-none"
                }`}>
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={
                  msg.senderId === authUser._id
                    ? authUser?.profilePic || assets.avatar_icon
                    : selectedUser?.profilePic || assets.avatar_icon
                }
                alt=""
                className="w-7 rounded-full"
              />
              <p className="text-gray-500">
                {formatMessageTime(msg.createdAt)}
              </p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>
      {/* bottom area  */}
      <div className="p-3 border-t border-gray-600 flex items-center gap-2">
        {" "}
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            onChange={(e) => setInput(e.target.value)}
            value={input}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSendMessage(e);
              }
            }}
          />
          <input
            type="file"
            id="image"
            accept="image/png, image/jpeg"
            onChange={handleSendImage}
            hidden
          />
          <label htmlFor="image">
            <img
              src={assets.gallery_icon}
              alt=""
              className="w-5 mr-2 cursor-pointer"
            />
          </label>
        </div>
        <img
          src={assets.send_button}
          alt=""
          className="w-7 cursor-pointer"
          onClick={handleSendMessage}
        />
      </div>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime,anywhere</p>
    </div>
  );
};

export default ChatContainer;
