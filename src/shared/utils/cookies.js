import { cookies } from "next/headers";

export const COOKIE_NAMES = {
  REFRESH_TOKEN: "refreshToken",
  ACCESS_TOKEN: "accessToken",
};

const BASE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const setRefreshTokenCookie = (token) => {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, token, {
    ...BASE_OPTIONS,
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const getRefreshTokenCookie = () => {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAMES.REFRESH_TOKEN)?.value || null;
};

export const clearRefreshTokenCookie = () => {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAMES.REFRESH_TOKEN, "", {
    ...BASE_OPTIONS,
    expires: new Date(0),
  });
};

export const setAccessTokenCookie = (token) => {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, token, {
    ...BASE_OPTIONS,
    maxAge: 60 * 15,
  });
};

export const getAccessTokenCookie = () => {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value || null;
};

export const clearAccessTokenCookie = () => {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAMES.ACCESS_TOKEN, "", {
    ...BASE_OPTIONS,
    expires: new Date(0),
  });
};
