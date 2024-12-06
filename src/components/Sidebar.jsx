import Logo from "@/assets/imgs/others/Logo.png";
import LogoSm from "@/assets/imgs/others/Logo-sm.png";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import DiceImg from "@/assets/imgs/banners/dice.png"

import { GoHomeFill } from "react-icons/go";
import { IoGameController } from "react-icons/io5";
import { CgMediaLive } from "react-icons/cg";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { FaHeadphones } from "react-icons/fa";

export default function Sidebar({ isSidebarShrinked }) {
  const [selectedPage, setSelectedPage] = useState("Home");
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
      label: "Live Games",
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
    <div className="flex flex-col gap-4">
      <img
        src={isSidebarShrinked ? LogoSm : Logo}
        alt="logo"
        className={`${!isSidebarShrinked ? "w-[248px] h-[72px]" : ""}`}
      />
      <ul className="w-full grid gap-2">
        {links.map((item, index) => (
          <li
            key={index}
            className={`relative ${
              pathname === item.link &&
              "bg-[linear-gradient(90deg,#2338A3_0.31%,rgba(0,75,247,0.04)81.53%)]"
            } p-3 rounded-lg`}
          >
            <Link
              to={item.link}
              onClick={() => setSelectedPage(item.label)}
              className={`flex items-center gap-2 ${
                pathname === item.link ? "text-white" : "text-muted"
              }`}
            >
              <item.icon /> {!isSidebarShrinked && item.label}
            </Link>

            {!isSidebarShrinked && pathname === item.link && <img src={DiceImg} alt="img" className="absolute right-0 -bottom-4"/>}
          </li>
        ))}
      </ul>
    </div>
  );
}
