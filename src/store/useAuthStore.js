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
        const { csrfToken } = await fetch("/api/csrf", {
          credentials: "include",
        }).then((res) => res.json());

        const data = await secureFetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({ email, password }),
        });

        if (!data.success) {
          throw new Error(data.message || "Login failed");
        }

        setAccessToken(data.accessToken);

        let profileData = null;

        try {
          const profile = await secureFetch("/api/v1/profile/me");
          profileData = profile.data;
        } catch (err) {
          console.error("Profile fetch failed:", err);
        }

        set({
          user: data.user,
          profile: profileData,
          isAuthenticated: true,
        });

        return data;
      },

      register: async (formDataInput) => {
        const { csrfToken } = await fetch("/api/csrf", {
          credentials: "include",
        }).then((res) => res.json());

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
          headers: {
            "x-csrf-token": csrfToken,
          },
          body: formData,
        });

        if (!data.success) {
          throw new Error(data.message || "Registration failed");
        }

        return data;
      },

      updateProfile: async (formDataInput) => {
        const { csrfToken } = await fetch("/api/csrf", {
          credentials: "include",
        }).then((res) => res.json());

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
          headers: {
            "x-csrf-token": csrfToken,
          },
          body: formData,
        });

        if (!data.success) {
          throw new Error(data.message || "Update failed");
        }

        set((state) => ({
          user: {
            ...state.user,
            ...data.user,
          },
        }));

        return data;
      },

      logout: async () => {
        const { csrfToken } = await fetch("/api/csrf", {
          credentials: "include",
        }).then((res) => res.json());

        await secureFetch("/api/auth/logout", {
          method: "POST",
          headers: {
            "x-csrf-token": csrfToken,
          },
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
