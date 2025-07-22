import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import {connectDB} from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

//App creation and server setup
const app = express();
const server = http.createServer(app);

//Initialze socket.io server
export const io = new Server(server,{
    cors:{origin:"*"}
})

//Store online Users
export const userSocketMap = {} //{ userId : socketId }

//Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId; // assume passed in query param

  if (userId) {
    userSocketMap[userId] = socket.id;
    socket.join(userId); // So you can emit to io.to(userId)
    console.log(`✅ User ${userId} connected`);
    io.emit("online-users", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    for (const id in userSocketMap) {
      if (userSocketMap[id] === socket.id) {
        delete userSocketMap[id];
        break;
      }
    }
  });
  io.emit("online-users", Object.keys(userSocketMap));
});


//Middleware setup
app.use(express.json({limit:'4mb'}));
app.use(cors());

// Routes Setup
app.use('/api/status',(req,res)=>res.send("Server is live"));
app.use("/api/auth",userRouter);
app.use("/api/messages",messageRouter);

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT,()=>console.log('Server running on PORT:'+PORT));