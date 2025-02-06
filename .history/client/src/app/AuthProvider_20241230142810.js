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

  const { data, error, isLoading } = useSWR("/auth/session", getSession, {
    onSuccess: (data, key, config) => {
      // console.log(data);
      if (!data?.success) {
        router.push(`/auth`);
      }

      if (uid === null) setUid(data?.data?._id);
      if (user === null) setUser(data?.data);
    },
    refreshInterval: 15 * 60 * 1000, // Refresh every 15 minutes
    revalidateOnMount: true,
    revalidateOnFocus: true,
    refreshWhenHidden: true,
  });

  // Returns to auth page
  // if(error) {

  // }

  return (
    <AuthContext.Provider value={{ uid, setUid, user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
