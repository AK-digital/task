"use client";
import { decryptToken, refreshToken } from "@/api/auth";
import { revalidatePage } from "@/api/project";
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
    refreshInterval: 12 * 60 * 60 * 1000, // Refresh every 12 hours
    revalidateOnFocus: false,
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

    socket.on("project-updated", () => {
      revalidatePage();
    });

    socket.on("member-revoked", (revokedUserId) => {
      if (revokedUserId === uid) {
        router.push("/projects");
      }
    });

    return () => {
      socket.off("logged in");
      socket.off("member-revoked");
    };
  }, [socket, uid, router]);

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
