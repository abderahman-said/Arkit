"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { 
  ImageIcon, 
  FileDown, 
  ScanText, 
  LayoutDashboard,
  Settings,
  History,
  Star,
  X,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import NextImage from "next/image";

const tools = [
  { 
    id: "dashboard", 
    icon: LayoutDashboard, 
    href: "/", 
    label: "common.dashboard",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "imageConverter", 
    icon: ImageIcon, 
    href: "/image-converter", 
    label: "tools.imageConverter.title",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "fileCompressor", 
    icon: FileDown, 
    href: "/file-compressor", 
    label: "tools.fileCompressor.title",
    color: "from-purple-500 to-blue-500"
  },
  { 
    id: "ocr", 
    icon: ScanText, 
    href: "/ocr", 
    label: "tools.ocr.title",
    color: "from-green-500 to-emerald-500"
  },
];

const menuItems = [
  {
    id: "favorites",
    icon: Star,
    href: "/favorites",
    label: "common.favorites",
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "history",
    icon: History,
    href: "/history",
    label: "common.history",
    color: "from-indigo-500 to-blue-500"
  },
  {
    id: "settings",
    icon: Settings,
    href: "/settings",
    label: "common.settings",
    color: "from-violet-500 to-purple-500"
  },
];

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const t = useTranslations();
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 rtl:right-0 rtl:left-auto top-16 h-[calc(100vh-4rem)] w-72 bg-card/95 backdrop-blur-xl border-r rtl:border-l rtl:border-r-0 border-border/50 shadow-2xl shadow-primary/10 z-50 md:hidden flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
            <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 rounded-lg blur-xl group-hover:bg-primary/50 transition-all duration-300" />
                <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-primary/60 border border-primary/30 group-hover:border-primary/60 group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                  <NextImage
                    src="/logo.png"
                    alt="Logo"
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain animate-pulse transition-all duration-300"
                  />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                  {t("common.title")}
                </span>
                <span className="text-xs text-muted-foreground">{t("common.controlPanel")}</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Tools */}
          <div className="flex-1 space-y-2 mb-4">
            <div className={cn(
              "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2"
            )}>
              <Zap className="h-3 w-3" />
              {t("common.tools")}
            </div>
            {tools.map((tool) => {
              const Icon = tool.icon;
              const isActive = pathname === tool.href;
              return (
                <Link key={tool.id} href={tool.href} className="block" onClick={onClose}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-300 relative group/btn overflow-hidden",
                      isActive
                        ? `bg-gradient-to-r ${tool.color} text-white shadow-lg shadow-primary/30 hover:shadow-xl`
                        : "hover:bg-accent/70 hover:shadow-md"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 rtl:right-0 rtl:left-auto top-0 bottom-0 w-1 bg-primary-foreground rounded-r rtl:rounded-l" />
                    )}
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-300",
                        isActive
                          ? "text-white scale-110"
                          : "text-foreground group-hover/btn:scale-110 group-hover/btn:rotate-6"
                      )}
                    />
                    <span className="font-medium">{t(tool.label)}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Menu Items */}
          <div className="space-y-2 border-t border-border/50 pt-4">
            <div className={cn(
              "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2"
            )}>
              <Settings className="h-3 w-3" />
              {t("common.menu")}
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link key={item.id} href={item.href} className="block" onClick={onClose}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 transition-all duration-300 relative group/btn overflow-hidden",
                      isActive
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-primary/30 hover:shadow-xl`
                        : "hover:bg-accent/70 hover:shadow-md"
                    )}
                  >
                    {isActive && (
                      <div className="absolute left-0 rtl:right-0 rtl:left-auto top-0 bottom-0 w-1 bg-primary-foreground rounded-r rtl:rounded-l" />
                    )}
                    <Icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all duration-300",
                        isActive
                          ? "text-white scale-110"
                          : "text-foreground group-hover/btn:scale-110 group-hover/btn:rotate-6"
                      )}
                    />
                    <span className="font-medium">{t(item.label)}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

