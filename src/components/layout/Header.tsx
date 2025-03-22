"use client";

import { useSession, signOut } from "next-auth/react";
import { PlusCircle, Bell, HelpCircle, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Header() {
  const { data: session, status } = useSession();
  
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-xl font-bold">
          DyzBox
        </Link>
        
        <button 
          className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <PlusCircle size={16} />
          <span>Compose</span>
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-gray-800">
          <Bell size={20} />
        </button>
        <button className="text-gray-500 hover:text-gray-800">
          <HelpCircle size={20} />
        </button>
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300">
          <User size={18} />
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {status === "authenticated" && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
            >
              Sign out
            </button>
          </div>
        )}
        
        {status === "unauthenticated" && (
          <a
            href="/api/auth/signin"
            className="text-sm text-gray-600 hover:text-gray-900 hover:underline"
          >
            Sign in
          </a>
        )}
      </div>
    </header>
  );
} 