import { io } from "socket.io-client";
import { getAuthToken } from "./api.js";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002/api";

let socket = null;

/**
 * Get a singleton Socket.IO client instance.
 * It connects to the same origin as the REST API (without the /api suffix).
 */
export const getSocket = () => {
  const token = getAuthToken();
  if (!token) return null;

  // If socket exists but token may have changed (e.g. after login as different user), reconnect
  if (socket) {
    const currentAuth = socket.auth?.token;
    if (currentAuth !== token) {
      socket.disconnect();
      socket = null;
    }
  }

  if (socket) return socket;

  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  socket = io(base, {
    auth: { token },
    autoConnect: true,
    // Polling fallback helps when websocket-only fails (corporate proxies, some hosts).
    transports: ["websocket", "polling"],
  });

  return socket;
};

/**
 * Disconnect and clear the socket. Call this on logout so the next user
 * gets a fresh connection with their own token.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

