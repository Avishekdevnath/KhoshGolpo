"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useSWRConfig } from "swr";

import { env } from "@/lib/config/env";
import { useAuth } from "@/lib/auth/hooks";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { accessToken, status } = useAuth();
  const { mutate } = useSWRConfig();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !accessToken) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      setSocketInstance(null);
      return;
    }

    const socket = io(env.socketUrl, {
      auth: {
        token: accessToken,
      },
    });

    socketRef.current = socket;
    setSocketInstance(socket);

    const revalidateThreads = () => {
      void mutate((key) => Array.isArray(key) && key[0] === "threads");
    };

    const revalidateThreadDetails = (threadId: string) => {
      void mutate((key) => Array.isArray(key) && key[0] === "threads" && key[1]?.threadId === threadId);
      void mutate((key) => Array.isArray(key) && key[0] === "admin-moderation-posts");
    };

    const revalidateNotifications = () => {
      void mutate((key) => Array.isArray(key) && key[0] === "notifications");
    };

    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    socket.on("thread.created", () => {
      revalidateThreads();
      void mutate((key) => Array.isArray(key) && key[0] === "admin-moderation-threads");
    });

    socket.on("post.created", (payload: { post: { threadId: string } }) => {
      revalidateThreads();
      revalidateThreadDetails(payload.post.threadId);
    });

    socket.on("notification.created", () => {
      revalidateNotifications();
    });

    return () => {
      socket.off("thread.created");
      socket.off("post.created");
      socket.off("notification.created");
      socket.disconnect();
      socketRef.current = null;
      setSocketInstance(null);
      setIsConnected(false);
    };
  }, [accessToken, mutate, status]);

  const value = useMemo<SocketContextValue>(
    () => ({ socket: socketInstance, isConnected }),
    [isConnected, socketInstance],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
