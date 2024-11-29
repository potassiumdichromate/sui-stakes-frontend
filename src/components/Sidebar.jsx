import Logo from "@/assets/imgs/others/Logo.png";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { GoHomeFill } from "react-icons/go";
import { IoGameController } from "react-icons/io5";
import { CgMediaLive } from "react-icons/cg";
import { BsFillQuestionCircleFill } from "react-icons/bs";
import { FaHeadphones } from "react-icons/fa";

export default function Sidebar() {
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
    <div>
      <img src={Logo} alt="logo" className="w-[248px] h-[72px]" />
      <ul className="w-full grid gap-2">
        {links.map((item, index) => (
          <li
            key={index}
            className={`${
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
              <item.icon /> {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
