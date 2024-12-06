import React from "react";
import Button from "./Button";
import { FaAngleLeft } from "react-icons/fa6";
import LogoSm from "@/assets/imgs/others/Logo-sm.png"

export default function Navbar({ isSidebarShrinked, setIsSidebarShrinked }) {
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => setIsSidebarShrinked(!isSidebarShrinked)}
        className="max-lg:hidden bg-[rgba(22,126,205,0.12)] p-2 rounded"
      >
        <FaAngleLeft className={`${isSidebarShrinked && "rotate-180"}`} />
      </button>

      <img src={LogoSm} alt="img" className="lg:hidden"/>

      <Button className="px-8">Login</Button>
    </div>
  );
}
