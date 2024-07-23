import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { decode } from "punycode";

const jwtKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaGFuIjoiMjMwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
const secretKey = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/login", (req, res) => {
  const token = jwt.sign({ _id: jwtKey }, secretKey);
  res
    .cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
    .json({
      msg: "Login Success",
    });
});

//using socket middleware
io.use((socket, next) => {
  cookieParser()(socket.request, socket.request.res, (err) => {
    if (err) {
      return next(new Error("Error parsing cookies"));
    }
    const token = socket.request.cookies.token;

    if (!token) return next(new Error("Authentication Error"));

    try {
      const decoded = jwt.verify(token, secretKey);
      socket.decoded = decoded; // Assign decoded data to socket for future use
      return next(); // Proceed if token is valid
    } catch (error) {
      return next(new Error("Authentication Error: Invalid token"));
    }
  });
});

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  //emitting a log to client, so client can see and use it
  // socket.emit("message", `Om shriganesay namah, Om Gan Ganpate Namah , ${socket.id}`);

  //broadcasting from one to another
  //menas if client one sent , then client2 will se that
  // socket.broadcast.emit("message", `Om shriganesay namah, Om Gan Ganpate Namah , ${socket.id}`);

  //disconnect user
  // socket.on("disconnect",()=>{
  //   console.log("user disconnected",socket.id);
  // })

  //here we are now emiiting message from client and showing in server
  socket.on("message", (data) => {
    console.log(data);
    //now i want that everyone will see that message
    //io means entire server or circuit
    // io.emit("recieve-messsage", data);

    //here we are sending data to all except me or who is writing this
    // socket.broadcast.emit("recieve-messsage", data);

    //now we want to send to a specific room
    // io.to(data.room).emit("recieve-messsage", data.messages);
    //from a socket, this is better process, from a specific socket
    socket.to(data.room).emit("recieve-messsage", data.messages);
  });

  //this way we can create a room and join people in the room, like whatsapp group

  socket.on("join-room", (room) => {
    socket.join(room);
    console.log(`user Joined ${room}`);
  });
});

server.listen(8000, (req, res) => {
  console.log("Server is listening on port 8000");
});
