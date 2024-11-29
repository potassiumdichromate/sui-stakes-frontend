import { cn } from "@/lib/utils";
import React from "react";

export default function Button({ onClick, className, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        `border-2 border-[#78B1FF] bg-[linear-gradient(180deg,#1352A7_0%,#006AFB_100%)] shadow-[0px_0px_12px_#0267F2] text-sm font-medium px-4 py-2 rounded-full ${className}`
      )}
    >
      {children}
    </button>
  );
}
