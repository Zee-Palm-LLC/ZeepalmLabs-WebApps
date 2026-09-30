import { createContext, useContext } from "react";

export const AppContext = createContext({
  reduced: false,
  started: true,
  soundOn: false,
  toggleSound: () => {},
  blip: () => {},
  scrollTo: () => {},
});

export function useApp() {
  return useContext(AppContext);
}
