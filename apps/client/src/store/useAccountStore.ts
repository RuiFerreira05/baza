import { env } from "@/lib/env";
import { ProfileDTO, StatusError } from "@baza/shared-types";
import { create } from "zustand";

interface accountState {
  bypassAuth: boolean;
  profile: ProfileDTO | null;
  loading: boolean;
  error: StatusError | null;
}

interface accountActions {
  setProfile: (profile: ProfileDTO | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: StatusError | null) => void;
  clear: () => void;
}

export const useAccountStore = create<accountState & accountActions>((set) => ({
  bypassAuth: __DEV__ && env.EXPO_PUBLIC_BYPASS_AUTH === "true",
  profile: null,
  loading: false,
  error: null,
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  clear: () => set({ profile: null, error: null, loading: false }),
}));
