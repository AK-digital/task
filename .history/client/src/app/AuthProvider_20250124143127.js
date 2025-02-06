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

      // If get session failed then redirect the user to the login page
      if (!response?.success) {
        router.push(`/auth`);
      }

      setUid(response?.data?._id);
      setUser(response?.data);
    },
    refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    revalidateOnMount: true, // Revalidate everytime componenets are mounted
    revalidateOnFocus: true, // Revalidate everytime the user focus the page
    refreshWhenHidden: true, // The request will be refreshed even if the user is not on the page
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
