// src/lib/socket.ts
import { io } from "socket.io-client";

const socket = io("http://10.0.2.111:3001", {
  withCredentials: true,
  autoConnect: false,
});

export default socket;
