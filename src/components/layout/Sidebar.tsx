import Link from "next/link";
import { 
  Inbox, 
  Star, 
  Send, 
  FileText, 
  Briefcase, 
  Receipt, 
  Newspaper 
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
  badge?: number;
};

function SidebarItem({ icon: Icon, label, href, active, badge }: SidebarItemProps) {
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
        active 
          ? "bg-gray-100 text-black" 
          : "text-gray-700 hover:text-black hover:bg-gray-50"
      )}
    >
      <Icon size={18} />
      <span>{label}</span>
      {badge !== undefined && (
        <span className="ml-auto bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

export function Sidebar() {
  // These would be fetched from an API in a real app
  const unreadCount = 14;

  return (
    <div className="w-56 bg-white border-r border-gray-200 h-full p-3 flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <SidebarItem 
          icon={Inbox} 
          label="Smart Inbox" 
          href="/inbox" 
          active={true} 
          badge={unreadCount} 
        />
        <SidebarItem 
          icon={Star} 
          label="Important" 
          href="/important" 
        />
        <SidebarItem 
          icon={Send} 
          label="Sent" 
          href="/sent" 
        />
        <SidebarItem 
          icon={FileText} 
          label="Drafts" 
          href="/drafts" 
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="px-3 text-xs font-medium text-gray-500">Categories</div>
        <div className="flex flex-col gap-1">
          <SidebarItem 
            icon={Briefcase} 
            label="Work" 
            href="/category/work" 
          />
          <SidebarItem 
            icon={Receipt} 
            label="Receipts" 
            href="/category/receipts" 
          />
          <SidebarItem 
            icon={Newspaper} 
            label="Newsletters" 
            href="/category/newsletters" 
          />
        </div>
      </div>
    </div>
  );
} 