// next-pwa.d.ts
declare module "next-pwa" {
    import { NextConfig } from "next";
  
    interface PWAConfig {
      dest?: string;
      register?: boolean;
      skipWaiting?: boolean;
      disable?: boolean;
      sw?: string;
      scope?: string;
      reloadOnOnline?: boolean;
      cacheOnFrontEndNav?: boolean;
      aggressiveFrontEndNavCaching?: boolean;
      publicExcludes?: string[];
      buildExcludes?: (string | RegExp)[];
      fallbacks?: {
        document?: string;
        image?: string;
        audio?: string;
        video?: string;
        font?: string;
      };
      cacheStartUrl?: boolean;
      dynamicStartUrl?: boolean;
      dynamicStartUrlRedirect?: string;
    }
  
    function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  
    export = withPWA;
  }