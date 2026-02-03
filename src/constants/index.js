import SlotMachineImg from "@/assets/imgs/games/slot-machine.png";
import SpinWheelImg from "@/assets/imgs/games/spin-wheel.png";
import RedDogImg from "@/assets/imgs/games/red-dog.png";
import PokerImg from "@/assets/imgs/games/poker.png";
import DiceImg from "@/assets/imgs/games/dice.png";
import MinesImg from "@/assets/imgs/games/mines.png";
import CardMonteImg from "@/assets/imgs/games/3-card-monte.png";
import BaccaratImg from "@/assets/imgs/games/baccarat.png";
import BingoImg from "@/assets/imgs/games/bingo.png";
import BlackJackImg from "@/assets/imgs/games/black-jack.png";
import BombDifusalImg from "@/assets/imgs/games/bomb-difusal.png";
import CheckersImg from "@/assets/imgs/games/checkers.png";
import CoinFlipImg from "@/assets/imgs/games/coin-flip.png";
import CrapsImg from "@/assets/imgs/games/craps.png";
import CrashGameImg from "@/assets/imgs/games/crash-game.png";
import HeadsTailsImg from "@/assets/imgs/games/heads-tails.png";
import HiLoImg from "@/assets/imgs/games/hi-lo.png";
import PaneltyImg from "@/assets/imgs/games/panelty.png";
import PlinkoImg from "@/assets/imgs/games/plinko.png";
import RouletteImg from "@/assets/imgs/games/roulette.png";

export const games = [
  // ==================== LIVE GAMES ====================
  {
    id: "plinko",
    image: PlinkoImg,
    title: "Plinko",
    minBet: 0.01,
    maxBet: 10,
    houseEdge: 1,
    status: "live",
  },
  {
    id: "crash-game",
    image: CrashGameImg,
    title: "Crash",
    minBet: 0.01,
    maxBet: 10,
    houseEdge: 1,
    status: "live",
  },
  {
    id: "mines",
    image: MinesImg,
    title: "Mines",
    minBet: 0.01,
    maxBet: 10,
    houseEdge: 1,
    status: "live",
  },
  {
    id: "spin-wheel",
    image: SpinWheelImg,
    title: "Wheel",
    minBet: 0.01,
    maxBet: 10,
    houseEdge: 1,
    status: "live",
  },
  {
    id: "race",
    image: HeadsTailsImg, // Use existing image or add race image
    title: "Race Kings",
    minBet: 0.01,
    maxBet: 10,
    houseEdge: 6,
    status: "live",
  },
  {
    id: "scratch",
    image: CardMonteImg, // Use existing image or add scratch image
    title: "Scratch Card",
    minBet: 0.01,
    maxBet: 10,
    houseEdge: 20,
    status: "live",
  },

  // ==================== COMING SOON ====================
  {
    id: "coin-flip",
    image: CoinFlipImg,
    title: "Coin Flip",
    minBet: 0.1,
    maxBet: 100,
    houseEdge: 2,
    status: "coming-soon",
  },
  {
    id: "dice",
    image: DiceImg,
    title: "Dice",
    minBet: 0.1,
    maxBet: 100,
    houseEdge: 2,
    status: "coming-soon",
  },
  {
    id: "slot-machine",
    image: SlotMachineImg,
    title: "Slot Machine",
    minBet: 0.1,
    maxBet: 100,
    houseEdge: 5,
    status: "coming-soon",
  },
  {
    id: "roulette",
    image: RouletteImg,
    title: "Roulette",
    minBet: 0.5,
    maxBet: 200,
    houseEdge: 2.7,
    status: "coming-soon",
  },
  {
    id: "red-dog",
    image: RedDogImg,
    title: "Red Dog",
    minBet: 0.5,
    maxBet: 100,
    houseEdge: 3,
    status: "coming-soon",
  },
  {
    id: "poker",
    image: PokerImg,
    title: "Poker",
    minBet: 1,
    maxBet: 200,
    houseEdge: 2,
    status: "coming-soon",
  },
  {
    id: "3-card-monte",
    image: CardMonteImg,
    title: "3 Card Monte",
    minBet: 0.5,
    maxBet: 50,
    houseEdge: 3,
    status: "coming-soon",
  },
  {
    id: "baccarat",
    image: BaccaratImg,
    title: "Baccarat",
    minBet: 1,
    maxBet: 200,
    houseEdge: 1.5,
    status: "coming-soon",
  },
  {
    id: "bingo",
    image: BingoImg,
    title: "Bingo",
    minBet: 0.5,
    maxBet: 50,
    houseEdge: 5,
    status: "coming-soon",
  },
  {
    id: "black-jack",
    image: BlackJackImg,
    title: "Black Jack",
    minBet: 1,
    maxBet: 100,
    houseEdge: 1,
    status: "coming-soon",
  },
  {
    id: "bomb-difusal",
    image: BombDifusalImg,
    title: "Bomb Difusal",
    minBet: 0.5,
    maxBet: 50,
    houseEdge: 3,
    status: "coming-soon",
  },
  {
    id: "checkers",
    image: CheckersImg,
    title: "Checkers",
    minBet: 0.5,
    maxBet: 50,
    houseEdge: 0,
    status: "coming-soon",
  },
  {
    id: "craps",
    image: CrapsImg,
    title: "Craps",
    minBet: 0.5,
    maxBet: 100,
    houseEdge: 1.4,
    status: "coming-soon",
  },
  {
    id: "heads-tails",
    image: HeadsTailsImg,
    title: "Heads Tails",
    minBet: 0.1,
    maxBet: 100,
    houseEdge: 2,
    status: "coming-soon",
  },
  {
    id: "hi-lo",
    image: HiLoImg,
    title: "Hi Lo",
    minBet: 0.5,
    maxBet: 100,
    houseEdge: 2.5,
    status: "coming-soon",
  },
  {
    id: "panelty",
    image: PaneltyImg,
    title: "Penalty",
    minBet: 0.5,
    maxBet: 50,
    houseEdge: 3,
    status: "coming-soon",
  },
];

// Blockchain Configuration - UPDATED
export const BLOCKCHAIN_CONFIG = {
  NETWORK: 'mainnet',
  PACKAGE_ID: '0xeecbb0b6df316cfddb7ae0285ff774abd7547b0d87647a404aa55758f5ff6d1a',
  HOUSE_POOL_ID: '0xbd1e3e92cbeb42a5e43f382add48e984e4e0be200f5ffb4f6162e55970529c3e',
  SUI_DECIMALS: 9,
};