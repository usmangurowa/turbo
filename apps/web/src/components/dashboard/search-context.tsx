"use client";

import * as React from "react";

import { SearchCommand } from "./search-command";

interface SearchCommandContextValue {
  openSearch: () => void;
}

const SearchCommandContext =
  React.createContext<SearchCommandContextValue | null>(null);

export const useSearchCommand = () => {
  const context = React.useContext(SearchCommandContext);
  if (!context) {
    throw new Error("useSearchCommand must be used within SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const value = React.useMemo(() => ({ openSearch: () => setOpen(true) }), []);

  return (
    <SearchCommandContext.Provider value={value}>
      {children}
      <SearchCommand open={open} onOpenChange={setOpen} />
    </SearchCommandContext.Provider>
  );
};
