"use client";

import { getSession } from "@/api/auth";
import { AuthContext } from "@/context/auth";
import socket from "@/utils/socket";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const { data, error } = useSWR("/auth/session", getSession, {
    refreshInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    revalidateOnMount: true, // Revalidate everytime componenets are mounted
    revalidateOnFocus: true, // Revalidate everytime the user focus the page
    refreshWhenHidden: true, // The request will be refreshed even if the user is not on the page
    refreshWhenOffline: true,
  });

  useEffect(() => {
    if (data) {
      const response = data;
      if (!response?.success) {
        router.push("/");
      } else {
        setUid(response?.data?._id);
        setUser(response?.data);
        socket.emit("logged in", response?.data?._id);
      }
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
      {children}
    </AuthContext.Provider>
  );
}
