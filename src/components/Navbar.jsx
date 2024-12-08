import React, { useState } from "react";
import Button from "./Button";
import { FaAngleLeft } from "react-icons/fa6";
import { SiSui } from "react-icons/si";
import { FiPlus } from "react-icons/fi";
import { RxExit } from "react-icons/rx";
import LogoSm from "@/assets/imgs/others/Logo-sm.png";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Navbar({ isSidebarShrinked, setIsSidebarShrinked }) {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [selectedTab, setSelectedTab] = useState("Deposit");
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
          <Dialog>
            <DialogTrigger asChild>
              <Button className={`px-4 flex items-center gap-6`}>
                <span className="flex items-center gap-2">
                  <SiSui /> | 9,800
                </span>
                <span className="bg-[rgba(255,255,255,0.22)] rounded-full p-1">
                  <FiPlus />
                </span>
              </Button>
            </DialogTrigger>

            <DialogContent className="bg-[#1C2455] border-none text-white">
              <h1>Wallet</h1>
              <div className="grid grid-cols-2 gap-2 bg-[rgba(0,0,0,0.20)] rounded-lg p-1">
                {["Deposit", "Withdrawl"].map((item, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedTab(item)}
                    className={`text-center ${
                      selectedTab === item ? "bg-[#0088FF]" : ""
                    } py-2 rounded-lg cursor-pointer`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {selectedTab === "Deposit" ? (
                <form className="space-y-6">
                  <div className="grid gap-2">
                    <label htmlFor="deposit">Deposit Amount:</label>
                    <input
                      type="text"
                      placeholder="Enter Amount"
                      className="p-2 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(37,95,255,0.20)] placeholder:text-[rgba(255,255,255,0.50)]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0088FF] w-full h-10 rounded-full"
                  >
                    Continue
                  </button>
                </form>
              ) : (
                <form className="space-y-6">
                  <div className="grid gap-2">
                    <label htmlFor="deposit">Withdrawl Amount:</label>
                    <input
                      type="text"
                      placeholder="Enter Amount"
                      className="p-2 rounded-lg bg-[rgba(255,255,255,0.06)] border border-[rgba(37,95,255,0.20)] placeholder:text-[rgba(255,255,255,0.50)]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0088FF] w-full h-10 rounded-full"
                  >
                    Continue
                  </button>
                </form>
              )}
            </DialogContent>
          </Dialog>

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
