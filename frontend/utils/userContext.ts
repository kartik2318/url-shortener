import { createContext } from "react";

export interface IUserContext {
  token: string | null;
  setToken: (token: string | null) => void;
  user: any;
  setUser: (user: any) => void;
  logout: () => void;
  }

export const UserContext = createContext<IUserContext>({
  token: null,
  setToken: () => {},
  user: null,
  setUser: () => {},
  logout: () => {},
});
