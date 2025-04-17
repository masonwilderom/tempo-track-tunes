
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Navigation from "./components/layout/Navigation";
import PlaylistsPage from "./pages/PlaylistsPage";
import PlaylistDetailPage from "./pages/PlaylistDetailPage";
import LibraryPage from "./pages/LibraryPage";
import LoginPage from "./pages/LoginPage";
import CallbackPage from "./pages/CallbackPage";
import NotFound from "./pages/NotFound";

// Create a new Query Client with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <Navigation />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/playlists" replace />} />
              <Route path="/playlists" element={<PlaylistsPage />} />
              <Route path="/playlists/:id" element={<PlaylistDetailPage />} />
              <Route path="/library" element={<LibraryPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/callback" element={<CallbackPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
