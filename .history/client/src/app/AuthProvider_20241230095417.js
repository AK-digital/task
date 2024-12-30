"use client";
import { getSession } from "@/api/auth";
import { AuthContext } from "@/context/auth";
import { useState } from "react";
import useSWR from "swr";

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState([]);

  const { data, error, isLoading } = useSWR("/auth/session", getSession, {
    refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    revalidateOnMount: true,
    revalidateOnFocus: true,
    refreshWhenHidden: true,
  });

  console.log(data);

  // Returns to auth page
  // if(error) {

  // }

  return (
    <AuthContext.Provider value={{ uid, setUid, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
