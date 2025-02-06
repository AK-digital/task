"use client";

import { io } from "socket.io-client";
import { useContext } from "react";
import { AuthContext } from "@/context/auth";
import { getCookie } from "cookies-next";

export default function useSocket() {
  const uid = getCookie("uid");
  const socket = io("http://localhost:5000", {
    query: { userId: uid },
  });

  return socket;
}
