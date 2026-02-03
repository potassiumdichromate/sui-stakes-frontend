import { useParams, Link } from 'react-router-dom';
import { games } from '@/constants';
import { 
  PlinkoWrapper,
  CrashWrapper,
  MinesWrapper,
  WheelWrapper,
  RaceWrapper,
  ScratchWrapper 
} from '@/components/games';
import { FaArrowLeft } from 'react-icons/fa6';

export default function GamePage() {
  const { gameId } = useParams();
  const game = games.find(g => g.id === gameId);

  if (!game) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Game not found</h1>
        <Link to="/games" className="text-blue-400 hover:underline">
          Back to Games
        </Link>
      </div>
    );
  }

  const renderGame = () => {
    if (game.status === 'coming-soon') {
      return (
        <div className="bg-[#1C2455] rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Coming Soon! 🚀</h2>
          <p className="text-gray-400 mb-6">
            {game.title} will be available soon. Stay tuned!
          </p>
          <Link 
            to="/games"
            className="bg-[#0088FF] px-6 py-3 rounded-lg inline-block hover:bg-[#0077EE]"
          >
            Browse Other Games
          </Link>
        </div>
      );
    }

    switch(gameId) {
      case 'plinko':
        return <PlinkoWrapper />;
      case 'crash-game':
        return <CrashWrapper />;
      case 'mines':
        return <MinesWrapper />;
      case 'spin-wheel':
        return <WheelWrapper />;
      case 'race':
        return <RaceWrapper />;
      case 'scratch':
        return <ScratchWrapper />;
      default:
        return (
          <div className="bg-[#1C2455] rounded-xl p-12 text-center">
            <p className="text-gray-400">Game implementation in progress...</p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            to="/games"
            className="bg-[rgba(22,126,205,0.12)] p-2 rounded hover:bg-[rgba(22,126,205,0.20)]"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{game.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span>Min Bet: {game.minBet} SUI</span>
              <span>•</span>
              <span>Max Bet: {game.maxBet} SUI</span>
              <span>•</span>
              <span>House Edge: {game.houseEdge}%</span>
            </div>
          </div>
        </div>

        {game.status === 'live' && (
          <div className="bg-green-500/20 border border-green-500 px-4 py-2 rounded-full">
            <span className="text-green-400 font-semibold">🟢 LIVE</span>
          </div>
        )}
      </div>

      {/* Game Container */}
      {renderGame()}
    </div>
  );
}