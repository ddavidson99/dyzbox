import "@/app/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import Providers from "./Providers";
import { Toaster } from 'react-hot-toast';
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { AnimationProvider } from "@/contexts/AnimationContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DYZBOX - AI-Powered Email Management",
  description: "Intelligent organization, speed, and privacy for your emails",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-background text-foreground`}>
        <Providers>
          <AnimationProvider>
            <SidebarProvider>
              <div className="flex flex-col h-screen">
                <Header />
                <div className="flex flex-1 overflow-hidden relative">
                  <Sidebar />
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
              </div>
            </SidebarProvider>
          </AnimationProvider>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
