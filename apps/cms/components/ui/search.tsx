"use client";

import { debounce } from "lodash";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";

import { Spinner } from "@/components/ui";

function Search() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [isSearching, setIsSearching] = useState(false);

  const [input, setInput] = useState(initialQuery);

  useEffect(() => {
    const debouncedUpdate = debounce((query: string) => {
      if (!isSearching) return;

      const params = new URLSearchParams(searchParams.toString());
      if (query === "") {
        params.delete("q");
      } else {
        params.set("q", query);
      }

      // Reset the pagination when searching so we start from the first page
      params.delete("p");
      router.push(`${pathname}?${params.toString()}`);
      setIsSearching(false);
    }, 500);

    debouncedUpdate(input);

    // Cleanup function to cancel any pending debounced calls
    return () => {
      debouncedUpdate.cancel();
    };
  }, [input, pathname, isSearching]);

  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400">
        {isSearching ? (
          <Spinner size={16} />
        ) : (
          <HiMiniMagnifyingGlass size={18} />
        )}
      </div>
      <input
        type="search"
        value={input}
        onChange={(e) => {
          setIsSearching(true);
          setInput(e.target.value);
        }}
        className="h-11 w-80 rounded-[8px] pl-10 pr-3.5 outline-offset-0 outline-neutral-950 placeholder:text-neutral-400"
        placeholder="Search…"
      />
    </div>
  );
}

export default Search;
