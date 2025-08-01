
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameState, Gesture, Winner, GameLogEntry, Result, GestureOrNull, WinnerOrNull } from './types';
import { GESTURES, GESTURE_EMOJIS, WINNING_LOGIC } from './constants';
import { detectGesture } from './services/geminiService';
import CameraView from './components/CameraView';
import GameLog from './components/GameLog';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.Idle);
  const [countdown, setCountdown] = useState<number>(3);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [gameLog, setGameLog] = useState<GameLogEntry[]>([]);
  const [lastResult, setLastResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const setupCamera = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraOn(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Camera access was denied. Please allow camera access in your browser settings and refresh.");
        setIsCameraOn(false);
      }
    }
  }, []);

  useEffect(() => {
    setupCamera();
  }, [setupCamera]);
  
  const determineWinner = (userChoice: Gesture, computerChoice: Gesture): Winner => {
    if (userChoice === computerChoice) {
      return Winner.Tie;
    }
    if (WINNING_LOGIC[userChoice] === computerChoice) {
      return Winner.User;
    }
    return Winner.Computer;
  };

  const captureAndProcess = useCallback(async () => {
    setGameState(GameState.Processing);
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if(context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64ImageData = canvas.toDataURL('image/jpeg').split(',')[1];
        
        const detectedUserGesture = await detectGesture(base64ImageData);

        if (detectedUserGesture === 'NONE') {
            setError("Could not detect a valid gesture. Please make sure your hand is clear and try again.");
            setGameState(GameState.Error);
            return;
        }

        const userChoice = detectedUserGesture;
        const computerChoice = GESTURES[Math.floor(Math.random() * GESTURES.length)];
        const winner = determineWinner(userChoice, computerChoice);

        const newLogEntry: GameLogEntry = { id: Date.now(), userChoice, computerChoice, winner };
        setGameLog(prevLog => [...prevLog, newLogEntry]);
        setLastResult({ userChoice, computerChoice, winner });
        setGameState(GameState.Results);
      }
    }
  }, []);


  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (gameState === GameState.Countdown && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (gameState === GameState.Countdown && countdown === 0) {
      captureAndProcess();
    }
    return () => clearTimeout(timer);
  }, [gameState, countdown, captureAndProcess]);


  const handlePlay = () => {
    setError(null);
    setLastResult(null);
    setCountdown(3);
    setGameState(GameState.Countdown);
  };
  
  const handlePlayAgain = () => {
      setGameState(GameState.Idle);
      setError(null);
      setLastResult(null);
  }

  const renderOverlay = () => {
    switch (gameState) {
      case GameState.Countdown:
        return (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-9xl font-bold text-white animate-ping">{countdown}</span>
          </div>
        );
      case GameState.Processing:
        return (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-indigo-400"></div>
            <p className="text-white text-xl">Analyzing...</p>
          </div>
        );
      case GameState.Results:
        if (!lastResult) return null;
        const { userChoice, computerChoice, winner } = lastResult;
        const winnerInfo = winner === Winner.User ? { text: 'You Win!', color: 'text-green-400' } : winner === Winner.Computer ? { text: 'Computer Wins!', color: 'text-red-400' } : { text: "It's a Tie!", color: 'text-yellow-400' };
        return (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4">
             <div className="text-center animate-fade-in">
              <h2 className={`text-4xl font-bold mb-4 ${winnerInfo.color}`}>{winnerInfo.text}</h2>
              <div className="flex items-center justify-center space-x-8 text-6xl">
                  <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-300">YOU</span>
                      <span title={userChoice || ''}>{userChoice && GESTURE_EMOJIS[userChoice]}</span>
                  </div>
                  <span className="text-2xl text-gray-400">vs</span>
                  <div className="flex flex-col items-center">
                      <span className="text-sm text-gray-300">CPU</span>
                      <span title={computerChoice || ''}>{computerChoice && GESTURE_EMOJIS[computerChoice]}</span>
                  </div>
              </div>
              <button onClick={handlePlayAgain} className="mt-8 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-lg">
                Play Again
              </button>
            </div>
          </div>
        );
        case GameState.Error:
            return (
                 <div className="absolute inset-0 bg-red-900/50 flex flex-col items-center justify-center p-4 text-center">
                     <h2 className="text-2xl font-bold text-red-300 mb-2">Oops!</h2>
                     <p className="text-white mb-4">{error}</p>
                     <button onClick={handlePlayAgain} className="bg-gray-200 hover:bg-white text-gray-800 font-bold py-2 px-6 rounded-lg transition-colors duration-200 shadow-lg">
                        Try Again
                     </button>
                 </div>
            );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6 lg:p-8 font-sans">
      <header className="w-full max-w-5xl text-center mb-6">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">
          Gesture Rock Paper Scissors
        </h1>
        <p className="text-gray-400 mt-2">Play against the AI using your camera!</p>
      </header>
      
      <main className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 relative">
          <CameraView ref={videoRef} isCameraOn={isCameraOn} />
          {renderOverlay()}
        </div>

        <div className="lg:col-span-2 flex flex-col space-y-6">
          <div className="bg-gray-800 rounded-lg p-4 shadow-lg flex items-center justify-center">
            {gameState === GameState.Idle && (
              <button 
                onClick={handlePlay} 
                disabled={!isCameraOn || gameState !== GameState.Idle}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 transform hover:scale-105 shadow-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Play Round</span>
              </button>
            )}
            { (gameState === GameState.Countdown || gameState === GameState.Processing) && (
                 <div className="text-center text-gray-400">
                    <p>Get your hand ready!</p>
                    <p className="font-bold text-lg">Show Rock, Paper, or Scissors.</p>
                 </div>
            )}
             { (gameState === GameState.Results || gameState === GameState.Error) && (
                 <div className="text-center text-gray-400">
                    <p>Game over!</p>
                    <p className="font-bold text-lg">Click "Play Again" in the camera view.</p>
                 </div>
            )}
          </div>
          <GameLog log={gameLog} />
        </div>
      </main>
      
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default App;
