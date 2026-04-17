import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      hydrated: false,

      setHydrated: () => set({ hydrated: true }),

      login: async (email, password) => {
        const csrfRes = await fetch("/api/csrf");
        const { csrfToken } = await csrfRes.json();

        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-csrf-token": csrfToken,
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: true,
        });

        return data;
      },

      register: async (formDataInput) => {
        const csrfRes = await fetch("/api/csrf");
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
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Registration failed");
        }

        return data;
      },

      updateProfile: async (formDataInput) => {
        const csrfRes = await fetch("/api/csrf");
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
        });

        const data = await res.json();

        if (!res.ok) {
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

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "auth-storage",
      onRehydrateStorage: () => (state) => {
        state.setHydrated();
      },
    },
  ),
);
