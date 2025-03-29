import { ReactNode } from "react";

export default function TrashLayout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full overflow-hidden">
      {children}
    </div>
  );
} 