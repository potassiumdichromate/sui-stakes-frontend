import React from "react";
import { Link, useLocation } from "react-router-dom";

import { GoHomeFill } from "react-icons/go";
import { IoGameController } from "react-icons/io5";
import { CgMediaLive } from "react-icons/cg";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { FaHeadphones } from "react-icons/fa";

export default function BottomNav() {
  const { pathname } = useLocation();
  const links = [
    {
      icon: GoHomeFill,
      label: "Home",
      link: "/",
    },
    {
      icon: IoGameController,
      label: "Games",
      link: "/games",
    },
    {
      icon: CgMediaLive,
      label: "Live",
      link: "/live-games",
    },
    {
      icon: BsFillQuestionCircleFill,
      label: "FAQ",
      link: "/faq",
    },
    {
      icon: FaHeadphones,
      label: "Contact",
      link: "/contact",
    },
  ];
  return (
    <nav className="lg:hidden fixed bottom-2 inset-x-2 grid grid-cols-5 bg-[linear-gradient(172deg,#08F_-16.67%,#004AF7_107.21%)] rounded-xl py-2 z-40">
      {links.map((item, index) => (
        <Link
          key={index}
          to={item.link}
          className={`flex flex-col items-center gap-1 ${pathname === item.link ? "text-white" : "text-white/70"}`}
        >
          <item.icon className="text-xl" /> {item.label}
        </Link>
      ))}
    </nav>
  );
}
