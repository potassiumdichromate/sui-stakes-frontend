import { games } from "@/constants";
import React from "react";

export default function Games() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">Featured Games</p>
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
