"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Inbox, Send, Archive, Trash, Tag, Settings, Plus } from "lucide-react";

const navItems = [
  {
    name: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    name: "Sent",
    href: "/sent",
    icon: Send,
  },
  {
    name: "Archive",
    href: "/archive",
    icon: Archive,
  },
  {
    name: "Trash",
    href: "/trash",
    icon: Trash,
  },
  {
    name: "Categories",
    href: "/categories",
    icon: Tag,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleCompose = () => {
    router.push('/inbox/compose');
  };

  return (
    <div className="w-64 border-r border-gray-200 h-full bg-white flex flex-col">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900">DyzBox</h1>
      </div>

      <div className="p-2">
        <button 
          onClick={handleCompose}
          className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center py-2 px-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Compose
        </button>
      </div>

      <nav className="mt-6 flex-1">
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900",
                  pathname === item.href ? "bg-gray-100 text-gray-900" : ""
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
} 