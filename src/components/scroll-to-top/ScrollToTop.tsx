import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToTopInstant = () => {
  const root = document.documentElement;
  const originalScrollBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";

  try {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  } catch {
    window.scrollTo(0, 0);
  }

  document.body.scrollTop = 0;
  root.scrollTop = 0;

  requestAnimationFrame(() => {
    root.style.scrollBehavior = originalScrollBehavior;
  });
};

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      scrollToTopInstant();
    }
  }, [pathname, hash]);

  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Skip hash jumps and external links
      if (href.startsWith("#") || href.includes("#")) return;
      if (
        target.target === "_blank" ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) {
        return;
      }

      // If clicking a link to the current path (e.g. Home link in footer while on Home page)
      try {
        const url = new URL(target.href, window.location.href);
        if (url.pathname === window.location.pathname && !url.hash) {
          scrollToTopInstant();
        }
      } catch {
        // ignore invalid urls
      }
    };

    window.addEventListener("click", handleLinkClick, true);
    return () => window.removeEventListener("click", handleLinkClick, true);
  }, []);

  return null;
};

export default ScrollToTop;
