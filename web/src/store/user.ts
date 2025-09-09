import { create } from "zustand";

export type CultivationPath = "Thanh Khí" | "Huyết Khí" | "Kim Nguyên";

type UserState = {
  cultivationPath: CultivationPath;
  xp: number;
  addXp: (amount: number) => void;
  setCultivationPath: (p: CultivationPath) => void;
};

export const useUserStore = create<UserState>((set) => ({
  cultivationPath: "Thanh Khí",
  xp: 0,
  addXp: (amount) => set((s) => ({ xp: Math.max(0, s.xp + Math.max(0, Math.floor(amount))) })),
  setCultivationPath: (p) => set({ cultivationPath: p }),
}));
