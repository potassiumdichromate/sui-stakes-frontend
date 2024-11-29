import { Routes, Route } from "react-router-dom";
import { Contact, FAQ, Games, Home, LiveGames } from "@/pages";

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/games" element={<Games />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/live-games" element={<LiveGames />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}
