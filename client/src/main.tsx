import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "@/hooks/use-auth";
import { WebSocketProvider } from "@/hooks/websocket-provider";

// Log a message to indicate client-side initialization
console.log("Green Path: Initializing application...");

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WebSocketProvider>
          <App />
        </WebSocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
