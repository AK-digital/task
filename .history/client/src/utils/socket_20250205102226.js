"use client";

import { io } from "socket.io-client";
import { useContext } from "react";
import { AuthContext } from "@/context/auth";

const useSocket = () => {
  const { uid } = useContext(AuthContext);
  console.log(uid, "from useSocket");
  const socket = io("http://localhost:5000", {
    query: { userId: uid ?? "" },
  });

  return socket;
};

export default useSocket;
