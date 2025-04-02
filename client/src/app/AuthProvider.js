"use client";
import { decryptToken, refreshToken } from "@/api/auth";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const { data, error, isLoading } = useSWR("/auth/session", decryptToken, {
    refreshInterval: 15 * 60 * 1000, // Refresh every 5 minutes
  });

  useEffect(() => {
    if (data) {
      const response = data;

      setUid(response?.data?._id);
      setUser(response?.data);
      socket.emit("logged in", response?.data?._id);
    }
  }, [data, router]);

  useEffect(() => {
    socket.on("logged in", (data) => {
      setUser(data);
    });

    return () => {
      socket.off("logged in");
    };
  }, [socket]);

  // Returns to auth page
  if (error) {
    router.push(`/`);
  }

  return (
    <AuthContext.Provider value={{ uid, setUid, user, setUser }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
