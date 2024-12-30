"use client";
import { getSession } from "@/api/auth";
import { AuthContext } from "@/context/auth";
import { useState } from "react";
import useSWR from "swr";

export default function AuthProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [user, setUser] = useState([]);

  const { data, error, isLoading } = useSWR("/auth/session", getSession, {
    onSuccess: (data, key, config) => {
      console.log(data.error);
      if (data.error === false) {
        setUid(data?.data?.userId);
        setUser((prevState) => [
          ...prevState,
          { email: data?.data?.userId, isAdmin: data?.data?.isAdmin },
        ]);
      } else {
        router.push(
          `${process.env.CLIENT_URL}/admin/auth/${process.env.CLIENT_SECRET_URL}`
        );
      }
    },
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
