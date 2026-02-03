import { Routes, Route } from "react-router-dom";
import { Contact, FAQ, Games, Home, LiveGames, GamePage } from "@/pages";  // ADD GamePage HERE

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/games" element={<Games />} />
      <Route path="/game/:gameId" element={<GamePage />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/live-games" element={<LiveGames />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}