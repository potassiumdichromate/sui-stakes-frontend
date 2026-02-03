import { games } from "@/constants";
import { Link } from "react-router-dom";
import Banner1 from "@/assets/imgs/banners/Banner1.png";
import Banner2 from "@/assets/imgs/banners/Banner2.png";

export default function Home() {
  // Filter live games only
  const liveGames = games.filter(g => g.status === 'live');
  const allGames = games;

  return (
    <section className="p-6 space-y-6">
      {/* Banners */}
      <div className="flex items-end gap-8">
        <img src={Banner1} alt="img" className="w-auto lg:h-[264px]" />
        <img src={Banner2} alt="img" className="max-lg:hidden w-auto h-[272px]" />
        <img src={Banner2} alt="img" className="max-lg:hidden w-auto h-[272px]" />
      </div>

      {/* Featured/Live Games */}
      {liveGames.length > 0 && (
        <div className="flex flex-col items-start lg:flex-row lg:items-stretch">
          <div className="bg-[#1C2353] p-2 flex items-center justify-center max-lg:rounded-t-xl lg:rounded-l-xl">
            <p className="uppercase font-bold lg:[writing-mode:vertical-rl] lg:rotate-180">
              Live Games
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 border border-[#1C2353] p-4 lg:bg-neutral-800 rounded-r-xl w-full">
            {liveGames.map((item, index) => (
              <Link 
                key={index} 
                to={`/game/${item.id}`}
                className="relative rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer group"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-[160px] object-cover"
                />
                <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-b from-transparent from-[25%] to-black/50 group-hover:to-black/70">
                  <h1 className="text-xl leading-tight font-bold uppercase">
                    {item.title}
                  </h1>
                </div>
                {/* Live Badge */}
                <div className="absolute top-2 right-2 bg-green-500 text-xs px-2 py-1 rounded-full font-bold">
                  LIVE
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* All Games */}
      <div className="space-y-6">
        <div className="flex items-center gap-6">
          <div className="w-full h-[1px] border border-border" />
          <p className="whitespace-nowrap text-muted font-medium">All Games</p>
          <div className="w-full h-[1px] border border-border" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
          {allGames.map((item, index) => (
            <Link 
              key={index} 
              to={`/game/${item.id}`}
              className="relative hover:scale-105 transition-transform cursor-pointer group"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[186.364px] object-cover rounded-xl"
              />
              <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-b from-transparent from-[25%] to-black/50 group-hover:to-black/70 rounded-xl">
                <h1 className="text-xl leading-tight font-bold uppercase">
                  {item.title}
                </h1>
              </div>
              
              {/* Status Badge */}
              {item.status === 'coming-soon' && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
                  SOON
                </div>
              )}
              {item.status === 'live' && (
                <div className="absolute top-2 right-2 bg-green-500 text-xs px-2 py-1 rounded-full font-bold">
                  LIVE
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}