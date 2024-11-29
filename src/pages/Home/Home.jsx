import { games } from "@/constants";
import BannerImg from "@/assets/imgs/banners/casino-banner.png";

export default function Home() {
  return (
    <section className="p-6 space-y-6">
      <div className="flex">
        <div className="relative rounded-2xl overflow-hidden">
          <img src={BannerImg} alt="img" className="w-auto h-[260px]" />
          <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-b from-transparent from-[25%] to-black/50">
            <p className="text-white/90 font-medium">GAME OF THE WEEK</p>
            <p className="text-2xl font-bold">BEAST PROTECTOR</p>
          </div>
        </div>
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">Live Games</p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <div className="grid grid-cols-5 gap-8">
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
    </section>
  );
}
