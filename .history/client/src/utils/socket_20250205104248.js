"use client";

import { io } from "socket.io-client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/context/auth";

export default function useSocket() {
  const data = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (data?.uid) {
      const newSocket = io("http://localhost:5000", {
        query: { userId: uid },
      });
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [data]);

  return socket;
}
