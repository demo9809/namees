"use client";

import { Search, Bell, Menu } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

export function Topbar() {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8 -gray-800 -gray-900">
      <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden -gray-300">
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator */}
      <div className="h-6 w-px bg-gray-200 lg:hidden -gray-700" aria-hidden="true" />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <form className="relative flex flex-1" action="#" method="GET">
          <label htmlFor="search-field" className="sr-only">
            Search
          </label>
          <Search
            className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400"
            aria-hidden="true"
          />
          <input
            id="search-field"
            className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm -gray-900 -white"
            placeholder="Search campaigns, products, templates..."
            type="search"
            name="search"
          />
        </form>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500 -gray-300">
            <span className="sr-only">View notifications</span>
            <Bell className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200 -gray-700" aria-hidden="true" />

          <div className="flex items-center gap-x-4">
            <span className="text-sm font-medium leading-6 text-gray-900 -white">
              {session?.user?.name || "User"}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 -gray-400 -gray-200"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
