"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, Fragment, useRef } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { 
  EnvelopeSimple, 
  PaperPlaneTilt, 
  ArchiveBox, 
  Trash, 
  Tag, 
  Plus, 
  Spinner, 
  PlusCircle, 
  Folder 
} from "@phosphor-icons/react";
import { getLabels, createLabel } from "@/app/actions/email";
import { toast } from "react-hot-toast";
import { useSidebar } from "./SidebarContext";

type Label = {
  id: string;
  name: string;
  type: string;
};

type CategoryLabel = {
  id: string;
  displayName: string;
};

const navItems = [
  {
    name: "Inbox",
    href: "/inbox",
    icon: EnvelopeSimple,
  },
  {
    name: "Sent",
    href: "/sent",
    icon: PaperPlaneTilt,
  },
  {
    name: "Archive",
    href: "/archive",
    icon: ArchiveBox,
  },
  {
    name: "Trash",
    href: "/trash",
    icon: Trash,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const [labels, setLabels] = useState<Label[]>([]);
  const [categoryLabels, setCategoryLabels] = useState<CategoryLabel[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateLabel, setShowCreateLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [creatingLabel, setCreatingLabel] = useState(false);
  const [expandedLabels, setExpandedLabels] = useState<Record<string, boolean>>({});
  const [showCategories, setShowCategories] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        isSidebarOpen && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target as Node) &&
        // Ignore clicks on the hamburger menu button which has its own handler
        !(event.target as Element)?.closest('[aria-label="Open menu"], [aria-label="Close menu"]')
      ) {
        closeSidebar();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen, closeSidebar]);

  useEffect(() => {
    async function fetchLabels() {
      setLoading(true);
      try {
        const response = await getLabels();
        if (response.success && response.labels) {
          // Extract category labels
          const categories = response.labels
            .filter(label => label.id.startsWith('CATEGORY_'))
            .map(label => {
              const displayPart = label.id.split('_')[1];
              return {
                id: label.id,
                displayName: displayPart.charAt(0).toUpperCase() + displayPart.slice(1).toLowerCase()
              };
            });
          setCategoryLabels(categories);
          
          // Filter out system labels that we already have in navItems and categories
          const userLabels = response.labels.filter(
            label => 
              (label.type !== 'system' || 
              (!['INBOX', 'SENT', 'TRASH', 'DRAFT', 'SPAM'].includes(label.id))) &&
              !label.id.startsWith('CATEGORY_')
          );
          setLabels(userLabels);
        }
      } catch (error) {
        console.error("Error fetching labels:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLabels();
  }, []);

  // Create a hierarchical structure from labels with slashes
  const organizeLabelsHierarchy = () => {
    const hierarchy: Record<string, any> = {};
    const rootLabels: Label[] = [];
    const parentLabels = new Set<string>();
    
    // First pass: identify all labels and parent paths
    labels.forEach(label => {
      const parts = label.name.split('/');
      
      if (parts.length === 1) {
        // This is a label without slashes
        rootLabels.push(label);
      } else {
        // This has a slash, identify the parent path
        const parentPath = parts[0];
        parentLabels.add(parentPath);
        
        // Create hierarchy entry for parent if it doesn't exist
        if (!hierarchy[parentPath]) {
          hierarchy[parentPath] = { 
            label: null, // Will be set if we find a matching label
            children: [] 
          };
        }
        
        // Add this label as a child
        hierarchy[parentPath].children.push({
          ...label,
          displayName: parts.slice(1).join('/')
        });
      }
    });
    
    // Second pass: match root labels with parent paths
    rootLabels.forEach(label => {
      if (parentLabels.has(label.name)) {
        // This root label is also a parent, store it in the hierarchy
        if (hierarchy[label.name]) {
          hierarchy[label.name].label = label;
        }
      }
    });
    
    // Build final result
    const result: Array<Label & { children?: any[] }> = [];
    
    // Add standalone root labels (not parents)
    rootLabels.filter(label => !parentLabels.has(label.name))
      .forEach(label => result.push(label));
    
    // Add parent labels with their children
    Object.keys(hierarchy).forEach(path => {
      const entry = hierarchy[path];
      // Use the actual label if we found one, or create a synthetic one
      const label = entry.label || {
        id: path,
        name: path,
        type: 'parent',
        displayName: path
      };
      
      // Add the children to the label
      result.push({
        ...label,
        children: entry.children.sort((a: any, b: any) => 
          a.displayName.localeCompare(b.displayName)
        )
      });
    });
    
    // Sort final result
    return result.sort((a, b) => a.name.localeCompare(b.name));
  };

  const hierarchicalLabels = organizeLabelsHierarchy();

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      toast.error("Label name cannot be empty");
      return;
    }
    
    setCreatingLabel(true);
    try {
      const result = await createLabel(newLabelName.trim());
      if (result.success && result.label) {
        setLabels([...labels, result.label]);
        setNewLabelName("");
        setShowCreateLabel(false);
        toast.success("Label created successfully");
      } else {
        toast.error(result.error || "Failed to create label");
      }
    } catch (error) {
      console.error("Error creating label:", error);
      toast.error("Failed to create label");
    } finally {
      setCreatingLabel(false);
    }
  };

  const toggleExpandLabel = (labelId: string) => {
    setExpandedLabels(prev => ({
      ...prev,
      [labelId]: !prev[labelId]
    }));
  };

  // Handle navigation and close sidebar
  const handleNavigation = (href: string) => {
    closeSidebar();
    router.push(href);
  };

  // Modified render function that uses Link for better navigation
  const renderLabelWithLink = (label: any, depth = 0) => {
    const hasChildren = label.children && label.children.length > 0;
    const isExpanded = expandedLabels[label.id] !== false; // Default to expanded
    
    return (
      <Fragment key={label.id}>
        <li>
          <div className="flex items-center">
            <Link 
              href={`/label/${encodeURIComponent(label.id)}`}
              className={cn(
                "flex flex-1 items-center gap-2 rounded-lg px-2 py-1 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100 text-xs relative z-30",
                pathname === `/label/${encodeURIComponent(label.id)}` ? "bg-gray-100 text-gray-900 font-medium" : "bg-white",
                depth > 0 ? "ml-3" : ""
              )}
              onClick={() => closeSidebar()}
            >
              <Tag size={14} className="min-w-3.5" />
              <span className="truncate">{label.displayName || label.name}</span>
            </Link>
            
            {hasChildren && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpandLabel(label.id);
                }}
                className="p-1 text-gray-500 hover:text-gray-700 relative z-30 bg-white"
              >
                <ChevronDown 
                  className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                />
              </button>
            )}
          </div>
          
          {hasChildren && isExpanded && (
            <ul className="space-y-0.5 mt-0.5">
              {label.children.map((child: any) => renderLabelWithLink(child, depth + 1))}
            </ul>
          )}
        </li>
      </Fragment>
    );
  };

  return (
    <div 
      ref={sidebarRef}
      className={cn(
        "fixed top-14 left-0 bottom-0 z-20 bg-white w-64 border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out shadow-lg",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      {/* Black overlay behind sidebar - only shown when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 top-14 bg-black/50 z-10"
          onClick={closeSidebar}
        />
      )}
      
      <nav className="flex-1 overflow-y-auto pt-3 relative z-30 bg-white">
        <div className="px-3 mb-1 bg-white">
          <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Mail</h2>
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link 
                href={item.href}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-2 py-1 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100 text-xs",
                  pathname === item.href ? "bg-gray-100 text-gray-900 font-medium" : "bg-white"
                )}
                onClick={() => closeSidebar()}
              >
                <item.icon className="h-3.5 w-3.5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Categories Section */}
        {categoryLabels.length > 0 && (
          <>
            <div className="px-3 mt-3 mb-1 flex items-center justify-between bg-white">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Categories</h2>
              <button 
                onClick={() => setShowCategories(!showCategories)}
                className="p-1 text-gray-500 hover:text-gray-700 bg-white"
              >
                <ChevronDown 
                  className={`h-3 w-3 transition-transform ${showCategories ? 'rotate-180' : ''}`} 
                />
              </button>
            </div>
            
            {showCategories && (
              <ul className="space-y-0.5 mb-2">
                {categoryLabels.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/label/${encodeURIComponent(category.id)}`}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-2 py-1 text-gray-700 transition-all hover:text-gray-900 hover:bg-gray-100 text-xs relative z-30",
                        pathname === `/label/${encodeURIComponent(category.id)}` ? "bg-gray-100 text-gray-900 font-medium" : "bg-white"
                      )}
                      onClick={() => closeSidebar()}
                    >
                      <Folder className="h-3.5 w-3.5" />
                      <span>{category.displayName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {labels.length > 0 && (
          <>
            <div className="px-3 my-2 flex items-center justify-between bg-white">
              <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider text-[10px]">Labels</h2>
              <button 
                onClick={() => setShowCreateLabel(!showCreateLabel)}
                className="text-gray-500 hover:text-gray-700 bg-white" 
                title="Create new label"
              >
                <PlusCircle size={14} />
              </button>
            </div>
            
            {showCreateLabel && (
              <div className="px-3 mb-2">
                <div className="flex items-center space-x-2 mb-1">
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="New label name"
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                    disabled={creatingLabel}
                  />
                  <button
                    onClick={handleCreateLabel}
                    disabled={creatingLabel || !newLabelName.trim()}
                    className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {creatingLabel ? <Spinner className="h-3 w-3 animate-spin" /> : "Add"}
                  </button>
                </div>
              </div>
            )}
            
            <ul className="space-y-0.5">
              {hierarchicalLabels.map((label) => renderLabelWithLink(label))}
            </ul>
          </>
        )}

        {loading && (
          <div className="flex justify-center py-3">
            <Spinner className="h-4 w-4 animate-spin text-gray-400" />
          </div>
        )}
      </nav>
    </div>
  );
} 