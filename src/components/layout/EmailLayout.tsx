import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { ReactNode } from "react";

interface EmailLayoutProps {
  children: ReactNode;
}

export function EmailLayout({ children }: EmailLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-grow flex overflow-hidden">
        <Sidebar />
        <main className="flex-grow overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
} 