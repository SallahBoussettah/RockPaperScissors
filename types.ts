
export enum Gesture {
  Rock = 'ROCK',
  Paper = 'PAPER',
  Scissors = 'SCISSORS',
}

export type GestureOrNull = Gesture | null;

export enum GameState {
  Idle = 'IDLE',
  Countdown = 'COUNTDOWN',
  Processing = 'PROCESSING',
  Results = 'RESULTS',
  Error = 'ERROR',
}

export enum Winner {
  User = 'USER',
  Computer = 'COMPUTER',
  Tie = 'TIE',
}

export type WinnerOrNull = Winner | null;

export interface GameLogEntry {
  id: number;
  userChoice: Gesture;
  computerChoice: Gesture;
  winner: Winner;
}

export interface Result {
  userChoice: GestureOrNull;
  computerChoice: GestureOrNull;
  winner: WinnerOrNull;
}
