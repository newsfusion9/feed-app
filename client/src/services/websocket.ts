import { QueryClient } from "@tanstack/react-query";
import { BASE_URL, WEB_SOCKET_URL } from "@/consts/general-const";
import { useToast } from "@/hooks/use-toast";

interface WebSocketConfig {
  queryClient: QueryClient;
  toast: ReturnType<typeof useToast>["toast"];
}

export const setupWebSocketConnection = ({
  queryClient,
  toast,
}: WebSocketConfig) => {
  const ws = new WebSocket(WEB_SOCKET_URL);

  ws.onopen = () => {
    console.log("Connected to WebSocket server");
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  ws.onclose = () => {
    console.log("Disconnected from WebSocket server");
  };

  return ws;
};
