import { create } from 'zustand';

interface User {
  id: number;
  firstName: string;
  username?: string;
}

interface Couple {
  id: string;
  inviteCode: string;
  user1Id: number;
  user1Name: string;
  user2Id?: number;
  user2Name?: string;
}

interface Wish {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  price?: string;
  status: 'wanted' | 'bought';
  createdBy: number;
  createdByName: string;
  boughtBy?: number;
  boughtByName?: string;
  boughtAt?: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  couple: Couple | null;
  wishes: Wish[];
  isLoading: boolean;
  
  setUser: (user: User) => void;
  setCouple: (couple: Couple | null) => void;
  setWishes: (wishes: Wish[]) => void;
  addWish: (wish: Wish) => void;
  updateWish: (wishId: string, updates: Partial<Wish>) => void;
  removeWish: (wishId: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  couple: null,
  wishes: [],
  isLoading: false,

  setUser: (user) => set({ user }),
  setCouple: (couple) => set({ couple }),
  setWishes: (wishes) => set({ wishes }),
  addWish: (wish) => set((state) => ({ wishes: [wish, ...state.wishes] })),
  updateWish: (wishId, updates) =>
    set((state) => ({
      wishes: state.wishes.map((w) => (w.id === wishId ? { ...w, ...updates } : w)),
    })),
  removeWish: (wishId) =>
    set((state) => ({ wishes: state.wishes.filter((w) => w.id !== wishId) })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
