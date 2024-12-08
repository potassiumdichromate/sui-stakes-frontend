import React, { useState } from "react";
import Button from "./Button";
import { FaAngleLeft } from "react-icons/fa6";
import { SiSui } from "react-icons/si";
import { FiPlus } from "react-icons/fi";
import { RxExit } from "react-icons/rx";
import LogoSm from "@/assets/imgs/others/Logo-sm.png";

export default function Navbar({ isSidebarShrinked, setIsSidebarShrinked }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  return (
    <div className="flex items-center justify-between">
      <button
        onClick={() => setIsSidebarShrinked(!isSidebarShrinked)}
        className="max-lg:hidden bg-[rgba(22,126,205,0.12)] p-2 rounded"
      >
        <FaAngleLeft className={`${isSidebarShrinked && "rotate-180"}`} />
      </button>

      <img src={LogoSm} alt="img" className="lg:hidden" />

      {!isAuthenticated ? (
        <Button className="px-8">Login</Button>
      ) : (
        <div className="flex items-center gap-6">
          <Button className={`px-4 flex items-center gap-6`}>
            <span className="flex items-center gap-2">
              <SiSui /> | 9,800
            </span>
            <span className="bg-[rgba(255,255,255,0.22)] rounded-full p-1">
              <FiPlus />
            </span>
          </Button>

          <button className="flex items-center gap-4 bg-[rgba(0,0,0,0.25)] lg:px-4 lg:py-2 rounded-full">
            <div className="bg-[linear-gradient(134deg,#DA19A4_2.51%,#FF8A00_105.88%)] rounded-full px-3 py-2 lg:px-2 lg:py-1 leading-none">
              R
            </div>
            <p className="max-lg:hidden">0x854e112....225xrf2</p>
          </button>

          <button className="max-lg:hidden">
            <RxExit className="text-lg text-[#0088FF]" />
          </button>
        </div>
      )}
    </div>
  );
}
