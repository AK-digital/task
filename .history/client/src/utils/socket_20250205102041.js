"use client";

import { io } from "socket.io-client";
import { useUser } from "../context/UserContext";

const useSocket = () => {
  const { user } = useUser();
  const socket = io("http://localhost:5000", {
    query: { userId: user ? user._id.toString() : "" },
  });

  return socket;
};

export default useSocket;
