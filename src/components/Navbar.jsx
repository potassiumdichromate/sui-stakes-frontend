import React from "react";
import Button from "./Button";
import { FaAngleLeft } from "react-icons/fa6";

export default function Navbar({ isSidebarShrinked, setIsSidebarShrinked }) {
  return (
    <div className="flex items-center justify-between">
      <button onClick={() => setIsSidebarShrinked(!isSidebarShrinked)} className="bg-[rgba(22,126,205,0.12)] p-2 rounded">
        <FaAngleLeft />
      </button>

      <Button className="px-8">Login</Button>
    </div>
  );
}
