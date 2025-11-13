"use client";

import { useEffect, useState } from "react";
import { Loader } from "./loader";

export function PageLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return <Loader />;
}

