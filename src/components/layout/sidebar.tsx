"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Megaphone, 
  LayoutTemplate, 
  PackageSearch, 
  Download, 
  Settings,
  CalendarDays,
  ImagePlus,
  Package,
  Tag
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Campaigns", href: "/campaigns", icon: Megaphone },
  { name: "Templates", href: "/templates", icon: LayoutTemplate },
  { name: "Products", href: "/products", icon: PackageSearch },
  { name: "Price Tags", href: "/price-tags", icon: Tag },
  { name: "Exports", href: "/exports", icon: Download },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4 -gray-800 -gray-900">
        <div className="flex h-16 shrink-0 items-center">
          <span className="text-xl font-bold tracking-tight text-blue-600 -blue-500">
            PosterPlatform
          </span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const isDashboard = item.href === "/";
                  const current = isDashboard ? pathname === "/" : isActive;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                          ${current
                            ? "bg-gray-50 text-blue-600 -gray-800 -blue-400"
                            : "text-gray-700 hover:bg-gray-50 hover:text-blue-600 -gray-400 -gray-800 -white"
                          }
                        `}
                      >
                        <item.icon
                          className={`
                            h-6 w-6 shrink-0
                            ${current ? "text-blue-600 -blue-400" : "text-gray-400 group-hover:text-blue-600 -hover:text-white"}
                          `}
                          aria-hidden="true"
                        />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
