"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

export default function TopProgressBar() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();

    const timer = setTimeout(() => {
      NProgress.done();
    }, 400); // tweak for feel

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
