"use client";

import { io } from "socket.io-client";

const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_API_URL}`, {
  transports: ["websocket", "polling"], // Force l'utilisation de WebSocket d'abord
  withCredentials: true, // Si votre API nécessite des cookies
  reconnection: true, // Essaye de se reconnecter automatiquement
  reconnectionAttempts: 5, // Nombre de tentatives avant d'abandonner
  reconnectionDelay: 2000, // Temps entre chaque tentative (2s)
  addTrailingSlash: false,
});

export default socket;
