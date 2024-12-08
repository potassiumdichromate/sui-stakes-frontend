import "./App.css";
import { Navbar, Sidebar } from "@/components";
import Router from "@/Router/Router";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import BottomNav from "./components/BottomNav";

export default function App() {
  const [isSidebarShrinked, setIsSidebarShrinked] = useState(false);

  return (
    <BrowserRouter>
      <div className="relative w-full min-h-screen bg-background text-foreground flex items-start antialiased max-lg:pb-16">
        <aside
          className={`max-lg:hidden sticky top-0 z-40 ${
            !isSidebarShrinked ? "w-[20%]" : "w-[5%]"
          } h-screen p-4 bg-sidebar-bg transition-all ease-in-out `}
        >
          <Sidebar isSidebarShrinked={isSidebarShrinked}/>
        </aside>
        <div
          className={`${
            !isSidebarShrinked ? "lg:w-[80%]" : "lg:w-[95%]"
          } min-h-screen flex flex-col`}
        >
          <header className="sticky top-0 w-full px-6 py-4 bg-navbar-bg z-40">
            <Navbar
              isSidebarShrinked={isSidebarShrinked}
              setIsSidebarShrinked={setIsSidebarShrinked}
            />
          </header>
          <main className="w-full flex-grow">
            <Router />
          </main>
          <BottomNav />
        </div>
      </div>
    </BrowserRouter>
  );
}
