"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useSession, signIn, signOut } from "next-auth/react";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, Globe, User, LogOut, Search, Bell, Menu, X } from "lucide-react";
import NextImage from "next/image";
import { useEffect, useState } from "react";

interface HeaderProps {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}

export function Header({ mobileMenuOpen = false, setMobileMenuOpen = () => {} }: HeaderProps) {
  const t = useTranslations();
  const locale = useLocale();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const switchLocale = (locale: string) => {
    router.replace(pathname, { locale });
  };

  if (!mounted) {
    return null;
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl shadow-2xl border-border/50 shadow-primary/10"
          : "bg-background/80 backdrop-blur-md border-border/30"
      }`}
    >
      {/* Gradient Border Effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="container flex h-16 items-center justify-between px-3 sm:px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="relative transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg md:hidden"
        >
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity" />
          {mobileMenuOpen ? (
            <X className="h-5 w-5 relative z-10 transition-transform duration-300" />
          ) : (
            <Menu className="h-5 w-5 relative z-10 transition-transform duration-300" />
          )}
        </Button>

        {/* Logo Section */}
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-3 group transition-all duration-300 hover:scale-105"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-primary/30 rounded-xl blur-2xl group-hover:bg-primary/50 group-hover:blur-3xl transition-all duration-500" />
            <div className="relative p-2 sm:p-2.5 rounded-xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 border-2 border-primary/30 group-hover:border-primary/60 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all duration-500">
              <NextImage
                src="/logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain animate-pulse group-hover:animate-spin transition-all duration-300"
              />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent group-hover:from-primary group-hover:via-primary group-hover:to-primary transition-all duration-300">
              {t("common.title")}
            </span>
            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:block">
              {t("common.controlPanel")}
            </span>
          </div>
        </Link>

        {/* Actions Section */}
        <div className="flex items-center gap-1">
          {/* Search Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
            className="relative transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg md:hidden"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity" />
            <Search className="h-5 w-5 relative z-10 transition-transform duration-300 hover:rotate-12" />
          </Button>
          
          {/* Search Bar (Desktop) */}
          {showSearch && (
            <div className="absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/50 shadow-lg md:hidden z-50 p-4">
              <Input
                type="text"
                placeholder={t("common.search")}
                className="w-full"
                autoFocus
              />
            </div>
          )}
          
          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg group"
              >
                <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <Globe className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:rotate-180" />
                <span className="sr-only">{t("common.language")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="animate-in fade-in-0 zoom-in-95 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl min-w-[140px]"
            >
              <DropdownMenuItem
                onClick={() => switchLocale("en")}
                className="cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 hover:scale-105"
              >
                <Globe className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                {t("common.english")}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => switchLocale("ar")}
                className="cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 hover:scale-105"
              >
                <Globe className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                {t("common.arabic")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg group"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-700 dark:-rotate-90 dark:scale-0 absolute group-hover:rotate-180" />
            <Moon className="h-5 w-5 rotate-90 scale-0 transition-all duration-700 dark:rotate-0 dark:scale-100 absolute group-hover:rotate-12" />
            <span className="sr-only">
              {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
            </span>
          </Button>

          {/* Notifications (Optional) */}
          <Button
            variant="ghost"
            size="icon"
            className="relative transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg hidden lg:flex"
          >
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-md opacity-0 hover:opacity-100 transition-opacity" />
            <Bell className="h-5 w-5 relative z-10 transition-transform duration-300 hover:rotate-12" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
          </Button>

          {/* User Menu */}
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative transition-all duration-300 hover:scale-110 hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-1.5 rounded-full bg-gradient-to-br from-primary to-purple-600 border-2 border-primary/30 group-hover:border-primary/60 transition-all duration-300">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="animate-in fade-in-0 zoom-in-95 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl min-w-[200px]"
              >
                <div className="px-3 py-2.5 border-b border-border/50">
                  <p className="font-semibold text-sm bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    {session.user?.name || t("common.user")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {session.user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-destructive/10 hover:to-red-500/10 hover:scale-105 text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                  {t("common.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="ghost"
              onClick={() => signIn(undefined, { callbackUrl: `/${locale}${pathname}` })}
              className="relative overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-500/10 hover:shadow-lg group"
            >
              <span className="relative z-10 font-medium">{t("common.signIn")}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/10 to-primary/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
