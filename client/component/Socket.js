"use client";
import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
const Socket = () => {
  const [messages, setMessages] = useState("");
  const [room, setRoom] = useState("");
  const [socketID, setSocketId] = useState("");
  const [myMessages, setMyMessages] = useState([]);
  const [roomName, setRoomName] = useState("");
  //here i am using useMemo to stop unusual re-render
  // const socket = io("http://localhost:8000");
  const socket = useMemo(
    () =>
      io("http://localhost:8000", {
        withCredentials: true,
      }),
    []
  );

  useEffect(() => {
    console.log(myMessages);
  }, [myMessages]);

  useEffect(() => {
    //here we can do this to connect with io
    socket.on("connect", () => {
      setSocketId(socket.id);
      console.log(`Connected ${socket.id}`);
    });
    //reading a message that is sent from
    // socket.on("message", (socket) => {
    //   console.log(socket);
    // });

    // return () => {
    //   socket.disconnect();
    // };

    //receivng message in all socket
    const receiveMessage = (data) => {
      setMyMessages((message) => [...message, data]);
    };

    socket.on("recieve-messsage", receiveMessage);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    socket.emit("message", { messages, room });
    setMessages("");
    setRoom("");
  };

  const joinRoomHandler = (e) => {
    e.preventDefault();
    socket.emit("join-room", roomName);
    setRoomName("");
  };

  return (
    <div>
      <h1 className=" text-3xl">Socket.io</h1>
      <p>{socketID}</p>

      <form onSubmit={joinRoomHandler}>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          label="join room"
          className=" border-[3px]"
          placeholder="type room name"
        />
        <button type="submit">submit</button>
      </form>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter message"
          onChange={(e) => {
            setMessages(e.target.value);
          }}
          className=" border"
          value={messages}
        />
        <input
          type="text"
          placeholder="Enter roomId"
          onChange={(e) => {
            setRoom(e.target.value);
          }}
          className=" border"
          value={room}
        />
        <button type="submit" className=" bg-rose-400 rounded px-2 py-0.5">
          submit
        </button>
      </form>
      <div className=" flex flex-col gap-1">
        {myMessages.map((data, idx) => (
          <p key={idx}>{data}</p>
        ))}
      </div>
    </div>
  );
};

export default Socket;
