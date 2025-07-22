import User from '../Models/User.js';
import Message from '../Models/Message.js'
import cloudinary from '../lib/cloudinary.js';
import { io,userSocketMap } from '../server.js';

export const getUsersForSidebar = async(req,res)=>{
    try{
        //Get All users except main
        const userId  =  req.user._id;
        const filteredUsers = await User.find({_id:{$ne:userId}}).select("-password");

        //Count number of messages not seen
         const unseenMessages = {}
         const promises = filteredUsers.map(async(user)=>{
            const messages = await Message.find({
                senderId:user._id,reciverId:userId,seen:false
            })
            if(messages.length > 0) {
                unseenMessages[user._id] = messages.length;
            }
         })

         await Promise.all(promises);
         res.json({
            success:true,
            users:filteredUsers,
            unseenMessages
         })

    }
    catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        })

    }
}


//Get all messages for a user:
export const getMessages = async (req, res) => {
    try {
      const { id: selectedUserId } = req.params; // ✅ corrected spelling
      const myId = req.user._id;
  
      const messages = await Message.find({
        $or: [
          { senderId: myId, reciverId: selectedUserId },
          { senderId: selectedUserId, reciverId: myId },
        ]
      }).sort({ createdAt: 1 }); // optional: sort oldest to newest
  
      await Message.updateMany(
        { senderId: selectedUserId, reciverId: myId },
        { seen: true }
      );
  
      res.json({ success: true, messages });
    } catch (error) {
      console.log(error.message);
      res.json({ success: false, message: error.message });
    }
  };
  
  


//api to make message as seen using message id
export const markMessageAsSeen = async(req,res) =>{
    try{
        const { id } = req.params;
        await Message.findByIdAndUpdate(id,{seen:true});
        res.json({success:true});
    }
    catch(error){
        console.log(error.message);
        res.json({
            success:false,
            message:error.message
        })

    }
}

//Send a message to a selected User
export const sendMessage = async (req, res) => {
    try {
      const { text, image } = req.body;
      const reciverId = req.params.id;
      const senderId = req.user._id;
  
      let imageUrl;
      if (image) {
        const uploadResponse = await cloudinary.uploader.upload(image);
        imageUrl = uploadResponse.secure_url;
      }
  
      const newMessage = await Message.create({
        senderId,
        reciverId,
        text,
        image: imageUrl,
      });
  
      // Emit to Receiver
      const receiverSocketId = userSocketMap[reciverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", newMessage);
      }
  
      // ✅ Emit to Sender also!
      const senderSocketId = userSocketMap[senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("newMessage", newMessage);
      }
  
      res.json({ success: true, newMessage }); // Don't forget to respond!
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message,
      });
    }
  };
  