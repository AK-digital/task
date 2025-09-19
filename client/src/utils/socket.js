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

// Throttling pour les événements fréquents
const throttledEvents = new Map();

const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

// Wrapper pour les émissions avec throttling
const originalEmit = socket.emit.bind(socket);
socket.emit = function(event, ...args) {
  // Events qui nécessitent un throttling
  const throttledEventTypes = ['update task', 'update time tracking', 'typing'];
  
  if (throttledEventTypes.includes(event)) {
    const key = `${event}_${args[0]}`; // Utiliser le premier argument comme clé (généralement projectId)
    
    if (!throttledEvents.has(key)) {
      throttledEvents.set(key, throttle(() => {
        originalEmit(event, ...args);
      }, 500)); // 500ms de throttling
    }
    
    throttledEvents.get(key)();
  } else {
    originalEmit(event, ...args);
  }
};

export default socket;
