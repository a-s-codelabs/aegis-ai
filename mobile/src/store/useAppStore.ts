import {create} from 'zustand';

type AppState = {
  visits: number;
  increment: () => void;
};

export const useAppStore = create<AppState>(set => ({
  visits: 0,
  increment: () => set(s => ({visits: s.visits + 1})),
}));

