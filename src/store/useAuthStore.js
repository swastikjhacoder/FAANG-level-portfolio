import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAccessToken, clearAccessToken } from "@/shared/lib/secureFetch";
import { secureFetch } from "@/shared/lib/secureFetch";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      login: async (email, password) => {
        const csrfRes = await fetch("/api/csrf", {
          credentials: "include",
        });

        const { csrfToken } = await csrfRes.json();

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({ email, password }),
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Login failed");
        }

        setAccessToken(data.accessToken);

        let profileData = null;

        try {
          const profileJson = await secureFetch("/api/v1/profile/me");

          profileData = profileJson.data || null;
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
        const csrfRes = await fetch("/api/csrf", {
          credentials: "include",
        });
        const { csrfToken } = await csrfRes.json();

        const formData = new FormData();

        formData.append("firstName", formDataInput.firstName);
        formData.append("lastName", formDataInput.lastName);
        formData.append("email", formDataInput.email);
        formData.append("password", formDataInput.password);

        if (formDataInput.image) {
          formData.append("file", formDataInput.image);
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "x-csrf-token": csrfToken,
          },
          body: formData,
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Registration failed");
        }

        return data;
      },

      updateProfile: async (formDataInput) => {
        const csrfRes = await fetch("/api/csrf", {
          credentials: "include",
        });
        const { csrfToken } = await csrfRes.json();

        const formData = new FormData();

        formData.append("firstName", formDataInput.firstName);
        formData.append("lastName", formDataInput.lastName);

        if (formDataInput.password) {
          formData.append("password", formDataInput.password);
        }

        if (formDataInput.image) {
          formData.append("file", formDataInput.image);
        }

        const res = await fetch("/api/profile/update", {
          method: "PUT",
          headers: {
            "x-csrf-token": csrfToken,
          },
          body: formData,
          credentials: "include",
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
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
        const csrfRes = await fetch("/api/csrf", {
          credentials: "include",
        });

        const { csrfToken } = await csrfRes.json();

        await fetch("/api/auth/logout", {
          method: "POST",
          credentials: "include",
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
