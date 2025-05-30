"use client";
import { Search } from "lucide-react";

export default function SearchForm() {
  return (
    <form className="relative w-full">
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-color-muted" />
      <input
        type="text"
        placeholder="Rechercher..."
        className="w-full py-2 pr-3 pl-9 rounded-xl border border-color-border-color text-text-color text-text-size-normal h-11 transition-all duration-200 ease-in-out hover:text-text-color hover:shadow-[0_0_15px_0_rgba(255,255,255,0.1)] focus:text-text-color focus:shadow-[0_0_15px_0_rgba(255,255,255,0.1)]"
      />
    </form>
  );
}
