import { games } from "@/constants";
import Cat1Img from "@/assets/imgs/banners/Cat1.png";
import Cat2Img from "@/assets/imgs/banners/Cat2.png";
import Cat3Img from "@/assets/imgs/banners/Cat3.png";
import Cat4Img from "@/assets/imgs/banners/Cat4.png";
import React from "react";

export default function LiveGames() {
  const cats = [
    {
      title: "Checkers",
      des: "Live Games 24/7",
      img: Cat1Img,
    },
    {
      title: "Casino",
      des: "Over 3000 games",
      img: Cat2Img,
    },
    {
      title: "Live-Games",
      des: "Live dealers",
      img: Cat3Img,
    },
    {
      title: "Poker",
      des: "Free Tournaments",
      img: Cat4Img,
    },
  ];

  return (
    <div className="p-6 space-y-6 overflow-hidden">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {cats.map((item, index) => (
          <div
            key={index}
            className="relative bg-[linear-gradient(90deg,#1E283F_100%,#141B2E99_60%)] flex items-center justify-between rounded-lg p-2"
          >
            <div className="space-y-1">
              <p className="lg:text-lg font-medium">{item.title}</p>
              <p className="text-xs lg:text-sm">{item.des}</p>
            </div>
            <img
              src={item.img}
              alt="img"
              className="absolute -right-2 lg:right-1 z-10"
            />

            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="145"
              height="142"
              viewBox="0 0 145 142"
              fill="none"
              className="absolute -right-8"
            >
              <g filter="url(#filter0_f_530_988)">
                <ellipse
                  cx="72.5"
                  cy="71"
                  rx="27.5"
                  ry="26"
                  fill="url(#paint0_linear_530_988)"
                />
              </g>
              <defs>
                <filter
                  id="filter0_f_530_988"
                  x="0"
                  y="0"
                  width="145"
                  height="142"
                  filterUnits="userSpaceOnUse"
                  colorInterpolationFilters="sRGB"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  />
                  <feGaussianBlur
                    stdDeviation="22.5"
                    result="effect1_foregroundBlur_530_988"
                  />
                </filter>
                <linearGradient
                  id="paint0_linear_530_988"
                  x1="72.5"
                  y1="45"
                  x2="72.5"
                  y2="97"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#1C369F" />
                  <stop offset="1" stopColor="#F12CFF" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">
            Featured Games
          </p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {games.slice(0, 10).map((item, index) => (
            <div key={index} className="relative">
              <img
                src={item.image}
                alt="img"
                width={217.023}
                height={186.364}
                className="w-full h-[186.364px] object-cover rounded-xl"
              />

              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-b from-transparent from-[25%] to-black/50">
                <h1 className="text-xl leading-tight font-bold uppercase">
                  {item.title}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">Live Games</p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {games.slice(11, 20).map((item, index) => (
            <div key={index} className="relative">
              <img
                src={item.image}
                alt="img"
                width={217.023}
                height={186.364}
                className="w-full h-[186.364px] object-cover rounded-xl"
              />

              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-b from-transparent from-[25%] to-black/50">
                <h1 className="text-xl leading-tight font-bold uppercase">
                  {item.title}
                </h1>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
