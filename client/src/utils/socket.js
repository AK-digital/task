"use client";

import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_API_URL}`, {
  transports: ["polling"], // POLLING UNIQUEMENT - pas de WebSocket
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
  addTrailingSlash: false,
});

export default socket;