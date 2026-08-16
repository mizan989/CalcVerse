import { createContext, useContext } from 'react';

export const LenisContext = createContext({
  scrollTo: (target) => {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  },
});

export function useLenis() {
  return useContext(LenisContext);
}
