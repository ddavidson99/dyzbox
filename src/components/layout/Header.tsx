"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  MagnifyingGlass, 
  User, 
  Gear,
  List,
  SignOut
} from "@phosphor-icons/react";
import { getLabels } from "@/app/actions/email";
import { useSidebar } from "./SidebarContext";
import ComposeButton from "../email/ComposeButton";

export function Header() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [categoryLabels, setCategoryLabels] = useState<Array<{id: string, displayName: string}>>([]);
  
  useEffect(() => {
    // Fetch labels to extract CATEGORY labels
    async function fetchLabels() {
      try {
        const response = await getLabels();
        if (response.success && response.labels) {
          // Extract and format CATEGORY labels
          const categories = response.labels
            .filter(label => label.id.startsWith('CATEGORY_'))
            .map(label => {
              // Extract the part after '_' and format it
              const displayPart = label.id.split('_')[1];
              const displayName = displayPart.charAt(0).toUpperCase() + displayPart.slice(1).toLowerCase();
              return {
                id: label.id,
                displayName
              };
            });
          setCategoryLabels(categories);
        }
      } catch (error) {
        console.error("Error fetching category labels:", error);
      }
    }

    fetchLabels();
  }, []);
  
  const handleSearchClick = () => {
    // Placeholder for search functionality
    console.log('Search clicked');
  };

  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 shadow-sm">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleSidebar}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <List size={24} weight="bold" />
          </button>
          <Link href="/" className="text-xl font-bold">
            DYZBOX
          </Link>
        </div>
        
        <div className="flex items-center space-x-6">
          <Link 
            href="/inbox"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/inbox" ? "font-bold text-gray-900" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Inbox
          </Link>
          
          <Link 
            href="/label/IMPORTANT"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/label/IMPORTANT" ? "font-bold text-gray-900" : "text-gray-600 hover:text-gray-900"
            )}
          >
            Important
          </Link>
          
          {categoryLabels.map(category => (
            <Link 
              key={category.id}
              href={`/label/${encodeURIComponent(category.id)}`}
              className={cn(
                "text-sm font-medium transition-colors",
                pathname === `/label/${encodeURIComponent(category.id)}` ? "font-bold text-gray-900" : "text-gray-600 hover:text-gray-900"
              )}
            >
              {category.displayName}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-6">
        <ComposeButton floating={false} />
        
        <button 
          onClick={handleSearchClick}
          className="text-gray-600 hover:text-gray-900 transition-colors"
          aria-label="Search"
        >
          <MagnifyingGlass size={22} weight="light" />
        </button>
        
        <div className="relative" ref={userMenuRef}>
          <button 
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            aria-label="User menu"
          >
            <User size={20} weight="light" />
          </button>
          
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
              <div className="py-2">
                {status === "authenticated" && (
                  <>
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                      {session.user?.email}
                    </div>
                    <button
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowUserMenu(false);
                        // Open settings (placeholder)
                        console.log('Settings clicked');
                      }}
                    >
                      <Gear size={16} className="mr-2" />
                      Settings
                    </button>
                    <button
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut({ callbackUrl: "/" });
                      }}
                    >
                      <SignOut size={16} className="mr-2" />
                      Sign out
                    </button>
                  </>
                )}
                
                {status === "unauthenticated" && (
                  <a
                    href="/api/auth/signin"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign in
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 