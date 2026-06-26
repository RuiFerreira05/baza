import { env } from "@/lib/env";
import { create } from "zustand";

interface accountState {
  bypassAuth: boolean;
}

export const useAccountStore = create<accountState>((set) => ({
  bypassAuth: __DEV__ && env.EXPO_PUBLIC_BYPASS_AUTH === "true",
}));
