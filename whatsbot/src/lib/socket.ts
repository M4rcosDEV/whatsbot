// src/lib/socket.ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3001", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
