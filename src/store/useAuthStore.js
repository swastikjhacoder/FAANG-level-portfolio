import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  clearAccessToken,
  secureFetch,
  setAccessToken,
} from "@/shared/lib/secureFetch";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      login: async (email, password) => {
        const data = await secureFetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setAccessToken(data.accessToken);

        let profileData = null;

        try {
          const profile = await secureFetch("/api/v1/profile/me");
          profileData = profile.data;
        } catch {}

        set(
          () => ({
            user: data.user,
            profile: profileData,
            isAuthenticated: true,
          }),
          true,
        );

        return data;
      },

      register: async (formDataInput) => {
        const formData = new FormData();

        formData.append("firstName", formDataInput.firstName);
        formData.append("lastName", formDataInput.lastName);
        formData.append("email", formDataInput.email);
        formData.append("password", formDataInput.password);

        if (formDataInput.image) {
          formData.append("file", formDataInput.image);
        }

        const data = await secureFetch("/api/auth/register", {
          method: "POST",
          body: formData,
        });

        return data;
      },

      updateProfile: async (formDataInput) => {
        const formData = new FormData();

        formData.append("firstName", formDataInput.firstName);
        formData.append("lastName", formDataInput.lastName);

        if (formDataInput.password) {
          formData.append("password", formDataInput.password);
        }

        if (formDataInput.image) {
          formData.append("file", formDataInput.image);
        }

        const data = await secureFetch("/api/profile/update", {
          method: "PATCH",
          body: formData,
        });

        set((state) => ({
          user: {
            ...state.user,
            ...data.user,
          },
        }));

        return data;
      },

      logout: async () => {
        await secureFetch("/api/auth/logout", {
          method: "POST",
        });

        clearAccessToken();

        set({
          user: null,
          profile: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    },
  ),
);
