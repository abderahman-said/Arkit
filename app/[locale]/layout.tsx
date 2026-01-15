import type { Metadata } from "next";
import { Inter, Cairo } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { HeaderWithMobileMenu } from "@/components/header-with-mobile-menu";
import { Sidebar } from "@/components/sidebar";
import { PageLoader } from "@/components/page-loader";
import { AIAssistant } from "@/components/ai-assistant";
import { GlobalDragDrop } from "@/components/global-drag-drop";
import { QuickActions } from "@/components/quick-actions";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getMessages({ locale });
  const messages = t as any; // Type assertion since getMessages returns AbstractIntlMessages

  const title = messages.common?.title || "Tools Hub";
  const description = messages.common?.description || "Simple electronic tools for everyday tasks";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: description,
    keywords: ["tools", "image converter", "image editor", "ocr", "file compressor", "utility", "online tools"],
    authors: [{ name: "Tools Hub Team" }],
    creator: "Tools Hub",
    publisher: "Tools Hub",
    applicationName: "Tools Hub",
    metadataBase: new URL("https://toolshub.bg"), // Replace with actual domain
    alternates: {
      canonical: "/",
      languages: {
        en: "/en",
        ar: "/ar",
      },
    },
    openGraph: {
      title: {
        default: title,
        template: `%s | ${title}`,
      },
      description: description,
      url: `/${locale}`,
      siteName: title,
      locale: locale,
      type: "website",
      images: [
        {
          url: "/og-image.png", // Ensure this image exists slightly
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      creator: "@toolshub",
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: "google-site-verification-code", // Placeholder
    },
    manifest: "/manifest.json",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "en" | "ar")) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body
        className={`${inter.variable} ${cairo.variable} ${locale === "ar" ? "font-cairo" : "font-inter"} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider>
            <NextIntlClientProvider messages={messages}>
              <PageLoader />
              <HeaderWithMobileMenu />
              <div className="flex relative">
                <Sidebar />
                <main className="flex-1 md:ml-64 rtl:md:mr-64 rtl:md:ml-0 transition-all duration-300 pt-16 md:pt-0">
                  {children}
                </main>
              </div>
              <AIAssistant />
              <GlobalDragDrop />
              <QuickActions />
            </NextIntlClientProvider>
          </SessionProvider>
        </ThemeProvider>

        {/* Firebase config injected from user-provided credentials */}
        <script
          id="firebase-config"
          dangerouslySetInnerHTML={{
            __html: `
            window.__FIREBASE_CONFIG__ = {
              apiKey: "AIzaSyBwyEDuSNRfRnXVg_BXA9sKcvN7Lw1pd7s",
              authDomain: "test-4d0d3.firebaseapp.com",
              projectId: "test-4d0d3",
              appId: "1:908899179213:web:57628b96a72845e7162784",
              storageBucket: "test-4d0d3.firebasestorage.app"
            };
          `}}
        />
        {/* Load Firebase App + Firestore via CDN and expose minimal API on window.__FB */}
        <script
          id="firebase-sdk-loader"
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
            import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
            import { getFirestore, doc, onSnapshot, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
            window.__FB = { initializeApp, getApps, getFirestore, doc, onSnapshot, setDoc };
          `}}
        />
      </body>
    </html>
  );
}
