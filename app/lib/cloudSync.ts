"use client";

// Optional Firebase Cloud Sync abstraction with graceful fallback.
// If Firebase packages are not installed, all functions will no-op
// and report unavailable status.

export type CloudSync = {
  available: boolean;
  connect: (opts: { userId?: string }) => Promise<void>;
  subscribe: (onData: (data: unknown) => void) => () => void;
  save: (data: unknown) => Promise<void>;
  status: () => "connected" | "unavailable" | "idle";
};

let state: { connected: boolean } = { connected: false };

export async function getCloudSync(): Promise<CloudSync> {
  try {
    // Prefer global CDN-loaded SDK if present
    const g: any = (typeof window !== 'undefined' ? (window as any).__FB : null);
    let fbApp: any;
    let fbFirestore: any;
    if (g && g.initializeApp) {
      fbApp = { initializeApp: g.initializeApp, getApps: g.getApps };
      fbFirestore = { getFirestore: g.getFirestore, doc: g.doc, onSnapshot: g.onSnapshot, setDoc: g.setDoc };
    } else {
      // Dynamic import; will throw if deps are not installed
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // fbApp = await import("firebase/app");
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // fbFirestore = await import("firebase/firestore");
      // Since we can't build with missing modules even dynamically, we just fallback.
      throw new Error("Firebase modules not installed");
    }

    const firebaseConfig = (window as any).__FIREBASE_CONFIG__ as
      | undefined
      | {
        apiKey: string;
        authDomain: string;
        projectId: string;
        appId?: string;
        storageBucket?: string;
      };

    let app: any;
    let db: any;
    let unsub: (() => void) | null = null;
    let docRef: any = null;

    return {
      available: true,
      async connect({ userId }) {
        if (!firebaseConfig) {
          // Allow the host app to set window.__FIREBASE_CONFIG__ later
          state.connected = false;
          return;
        }
        app = fbApp.getApps().length ? fbApp.getApps()[0] : fbApp.initializeApp(firebaseConfig);
        db = fbFirestore.getFirestore(app);
        const uid = userId || "anonymous";
        docRef = fbFirestore.doc(db, "uiSettings", uid);
        state.connected = true;
      },
      subscribe(onData) {
        if (!state.connected || !docRef) return () => { };
        unsub = fbFirestore.onSnapshot(docRef, (snap: any) => {
          if (snap.exists()) {
            onData(snap.data());
          }
        });
        return () => {
          if (unsub) unsub();
          unsub = null;
        };
      },
      async save(data) {
        if (!state.connected || !docRef) return;
        await fbFirestore.setDoc(docRef, data, { merge: true });
      },
      status() {
        return state.connected ? "connected" : "idle";
      },
    };
  } catch {
    // Fallback no-op implementation
    return {
      available: false,
      async connect() { },
      subscribe() {
        return () => { };
      },
      async save() { },
      status() {
        return "unavailable";
      },
    };
  }
}


