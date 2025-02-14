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
    refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    revalidateOnMount: true, // Revalidate everytime componenets are mounted
    revalidateOnFocus: true, // Revalidate everytime the user focus the page
    refreshWhenHidden: true, // The request will be refreshed even if the user is not on the page
    refreshWhenOffline: true,
  });

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const handleSession = async () => {
      try {
        if (data) {
          const response = data;
          if (!response?.success) {
            if (retryCount < maxRetries) {
              retryCount++;
              // Attendre un peu avant de réessayer
              setTimeout(() => handleSession(), 1000 * retryCount);
              return;
            }
            router.push(`/`);
          } else {
            setUid(response?.data?._id);
            setUser(response?.data);
          }
        }
      } catch (error) {
        console.error("Session error:", error);
      }
    };

    handleSession();
  }, [data, router]);

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
