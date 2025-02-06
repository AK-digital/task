"use client";
import { getSession } from "@/api/auth";
import { AuthContext } from "@/context/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const { error } = useSWR("/auth/session", getSession, {
    onSuccess: (data, key, config) => {
      const response = data;

      if (!response?.success) {
        router.push(`/auth`);
      }

      if (uid === null) setUid(response?.data?._id); // If uid is null
      if (user === null) setUser(response?.data);
    },
    refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    revalidateOnMount: true,
    revalidateOnFocus: true,
    refreshWhenHidden: true,
    revalidateOnReconnect: true,
  });

  // Returns to auth page
  if (error) {
    router.push(`/auth`);
  }

  return (
    <AuthContext.Provider value={{ uid, setUid, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
