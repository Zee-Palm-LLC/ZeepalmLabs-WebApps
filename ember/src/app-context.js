import { createContext, useContext } from "react";

export const AppContext = createContext({
  reduced: false,
  started: true,
  soundOn: false,
  toggleSound: () => {},
  bell: () => {},
  tick: () => {},
  scrollTo: () => {},
  requestCut: () => {},
  cutRequest: null,
});

export function useApp() {
  return useContext(AppContext);
}
