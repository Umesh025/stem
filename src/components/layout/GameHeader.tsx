// import React from 'react';
// import type { GameState } from "../../types";

// interface GameHeaderProps {
//   gameState: GameState;
//   onExit: () => void;
// }

// export const GameHeader: React.FC<GameHeaderProps> = ({ gameState, onExit }) => {
//   const { score, lives } = gameState;
  
//   return (
//     <div className="w-full flex justify-between items-center px-4 py-2">
//       <button
//         onClick={onExit}
//         className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg"
//       >
//         Finish
//       </button>
      
//       <div className="flex gap-4 mt-20 items-center px-4 py-2">
//         <div className="score-box bg-yellow-300 px-6 py-3 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
//           <span className="text-2xl font-bold">Score: {score}</span>
//         </div>
//         <div className="lives-box bg-red-400 px-6 py-3 rounded-xl shadow-lg">
//           <span className="text-2xl font-bold">
//             {[...Array(Math.max(0, lives))].map((_, i) => (
//               <span key={i} role="img" aria-label="heart">❤️</span>
//             ))}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default GameHeader;
import React from 'react';
import type { GameState } from "../../types";

interface GameHeaderProps {
  gameState: GameState;
  onExit: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ gameState, onExit }) => {
  const { score, lives } = gameState;
  
  return (
    <div className="w-full min-h-[200px] relative">
      {/* Exit button positioned absolutely in the top-left */}
      <button
        onClick={onExit}
        className="absolute top-4 left-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
      >
        Finish
      </button>
      
      {/* Centered content container */}
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 pt-8">
        {/* Score box with enhanced styling */}
        <div className="score-box bg-yellow-300 px-8 py-4 rounded-xl shadow-lg transform hover:scale-110 transition-transform">
          <span className="text-3xl font-bold text-gray-800">Score: {score}</span>
        </div>
        
        {/* Lives box with enhanced styling */}
        <div className="lives-box bg-red-400 px-8 py-4 rounded-xl shadow-lg transform hover:scale-105 transition-transform">
          <span className="text-2xl font-bold flex justify-center">
            {[...Array(Math.max(0, lives))].map((_, i) => (
              <span 
                key={i} 
                role="img" 
                aria-label="heart"
                className="animate-pulse"
              >
                ❤️
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;