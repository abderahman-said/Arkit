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
  ChevronLeft,
  ChevronRight,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
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
    id: "image-converter", 
    icon: ImageIcon, 
    href: "/image-converter", 
    label: "tools.imageConverter.title",
    color: "from-blue-500 to-cyan-500"
  },
  { 
    id: "image-editor", 
    icon: ScanText, 
    href: "/image-editor", 
    label: "imageEditor.title",
    color: "from-purple-500 to-pink-500"
  },
  { 
    id: "file-compressor", 
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
    color: "from-indigo-500 to-purple-500"
  },
  { 
    id: "settings", 
    icon: Settings, 
    href: "/settings", 
    label: "common.settings",
    color: "from-violet-500 to-purple-500"
  },
];

export function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 rtl:right-0 rtl:left-auto top-16 h-[calc(100vh-4rem)] bg-card/95 backdrop-blur-xl border-r rtl:border-l rtl:border-r-0 border-border/50 shadow-2xl shadow-primary/10 transition-all duration-500 z-40 hidden md:flex flex-col",
        collapsed ? "w-20" : "w-72"
      )}
    >
      {/* Gradient Border */}
      <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto w-px bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
      
      <div className="flex flex-col h-full p-4 overflow-y-auto">
        {/* Logo/Collapse Button */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/50">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-3 group">
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
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center">
              <div className="relative p-2 rounded-lg bg-gradient-to-br from-primary via-primary/80 to-primary/60 border border-primary/30">
                <NextImage
                  src="/logo.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain animate-pulse transition-all duration-300"
                />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto rtl:mr-auto rtl:ml-0 transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg"
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 transition-transform duration-300" />
            ) : (
              <ChevronLeft className="h-4 w-4 transition-transform duration-300" />
            )}
          </Button>
        </div>

        {/* Tools Section */}
        <div className="flex-1 space-y-2 mb-4">
          <div className={cn(
            "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2",
            collapsed && "hidden"
          )}>
            <Zap className="h-3 w-3" />
            {t("common.tools")}
          </div>
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = pathname === tool.href || (tool.href !== "/" && pathname.startsWith(tool.href));
            return (
              <Link key={tool.id} href={tool.href} className="block">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-300 relative group/btn overflow-hidden",
                    isActive 
                      ? `bg-gradient-to-r ${tool.color} text-white shadow-lg shadow-primary/30 hover:shadow-xl` 
                      : "hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5 hover:shadow-md",
                    collapsed && "justify-center px-0 w-full"
                  )}
                  title={collapsed ? t(tool.label) : undefined}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-r ${tool.color} opacity-20`} />
                      <div className="absolute left-0 rtl:right-0 rtl:left-auto top-0 bottom-0 w-1.5 bg-white rounded-r rtl:rounded-l shadow-lg" />
                    </>
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 p-1.5 rounded-lg transition-all duration-300",
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm" 
                      : `bg-gradient-to-br ${tool.color} opacity-0 group-hover/btn:opacity-100`
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all duration-300",
                      isActive 
                        ? "text-white scale-110" 
                        : "text-foreground group-hover/btn:scale-110 group-hover/btn:rotate-6"
                    )} />
                  </div>
                  
                  {/* Label */}
                  {!collapsed && (
                    <span className="relative z-10 font-medium transition-all duration-300">
                      {t(tool.label)}
                    </span>
                  )}
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Menu Items */}
        <div className="space-y-2 border-t border-border/50 pt-4">
          <div className={cn(
            "text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2 flex items-center gap-2",
            collapsed && "hidden"
          )}>
            <Settings className="h-3 w-3" />
            {t("common.menu")}
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.id} href={item.href} className="block">
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 transition-all duration-300 relative group/btn overflow-hidden",
                    isActive 
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-primary/30 hover:shadow-xl` 
                      : "hover:bg-gradient-to-r hover:from-primary/5 hover:to-purple-500/5 hover:shadow-md",
                    collapsed && "justify-center px-0 w-full"
                  )}
                  title={collapsed ? t(item.label) : undefined}
                >
                  {/* Active Indicator */}
                  {isActive && (
                    <>
                      <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-20`} />
                      <div className="absolute left-0 rtl:right-0 rtl:left-auto top-0 bottom-0 w-1.5 bg-white rounded-r rtl:rounded-l shadow-lg" />
                    </>
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 p-1.5 rounded-lg transition-all duration-300",
                    isActive 
                      ? "bg-white/20 backdrop-blur-sm" 
                      : `bg-gradient-to-br ${item.color} opacity-0 group-hover/btn:opacity-100`
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 flex-shrink-0 transition-all duration-300",
                      isActive 
                        ? "text-white scale-110" 
                        : "text-foreground group-hover/btn:scale-110 group-hover/btn:rotate-6"
                    )} />
                  </div>
                  
                  {/* Label */}
                  {!collapsed && (
                    <span className="relative z-10 font-medium transition-all duration-300">
                      {t(item.label)}
                    </span>
                  )}
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
