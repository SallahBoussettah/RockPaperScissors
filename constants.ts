
import { Gesture } from './types';

export const GESTURES: Gesture[] = [Gesture.Rock, Gesture.Paper, Gesture.Scissors];

export const GESTURE_EMOJIS: Record<Gesture, string> = {
  [Gesture.Rock]: '✊',
  [Gesture.Paper]: '✋',
  [Gesture.Scissors]: '✌️',
};

export const WINNING_LOGIC: Record<Gesture, Gesture> = {
  [Gesture.Rock]: Gesture.Scissors,
  [Gesture.Paper]: Gesture.Rock,
  [Gesture.Scissors]: Gesture.Paper,
};
