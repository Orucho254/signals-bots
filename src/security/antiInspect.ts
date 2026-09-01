/**
 * Advanced Client Security & Anti-Inspection Shield
 * Protects against inspection, devtools hooking, source scraping, and cloning.
 */

export function initAntiInspectShield(): () => void {
  // 1. Block Context Menu across entire window
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  // 2. Block Dragging of assets/text to prevent cloning
  const handleDragStart = (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === "IMG" || target.tagName === "A" || target.getAttribute("draggable") === "false")) {
      e.preventDefault();
      return false;
    }
  };

  // 3. Block Developer Keyboard Combinations (Windows, Linux, Kali, macOS)
  const handleKeyDown = (e: KeyboardEvent) => {
    // Disable F12 Key
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const isCmdOrCtrl = e.ctrlKey || e.metaKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;
    const keyLower = e.key ? e.key.toLowerCase() : "";
    const keyCode = e.keyCode;

    if (isCmdOrCtrl) {
      // Ctrl+U / Cmd+U (View Source)
      if (keyLower === "u" || keyCode === 85) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+I / Cmd+Opt+I (Developer Tools)
      if (isShift && (keyLower === "i" || keyCode === 73)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+J / Cmd+Opt+J (Console window)
      if (isShift && (keyLower === "j" || keyCode === 74)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+C / Cmd+Opt+C (Inspect element)
      if (isShift && (keyLower === "c" || keyCode === 67)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+K (Firefox Web Console in Kali Linux)
      if (isShift && (keyLower === "k" || keyCode === 75)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+Shift+E (Network Inspector)
      if (isShift && (keyLower === "e" || keyCode === 69)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+S / Cmd+S (Save Page as HTML/cloning)
      if (keyLower === "s" || keyCode === 83) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // Ctrl+P (Print to PDF source capture)
      if (keyLower === "p" || keyCode === 80) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }

    // Mac Cmd+Alt combinations
    if (isCmdOrCtrl && isAlt) {
      if (keyLower === "i" || keyLower === "j" || keyLower === "c" || keyLower === "u") {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    }
  };

  // 4. Neutralize and sanitize console outputs in client runtime
  if (typeof window !== "undefined") {
    try {
      const noop = () => {};
      window.console.log = noop;
      window.console.info = noop;
      window.console.dir = noop;
      window.console.table = noop;
      window.console.debug = noop;
      window.console.trace = noop;
    } catch {
      // Ignore if read-only
    }
  }

  // 5. Anti-Debugging timing loop
  let devToolsChecker: any = null;
  if (typeof window !== "undefined") {
    devToolsChecker = setInterval(() => {
      const startTime = performance.now();
      const endTime = performance.now();
      if (endTime - startTime > 150) {
        try {
          window.console.clear();
        } catch {}
      }
    }, 1500);
  }

  document.addEventListener("contextmenu", handleContextMenu, { capture: true });
  document.addEventListener("keydown", handleKeyDown, { capture: true });
  document.addEventListener("dragstart", handleDragStart, { capture: true });

  return () => {
    document.removeEventListener("contextmenu", handleContextMenu, { capture: true });
    document.removeEventListener("keydown", handleKeyDown, { capture: true });
    document.removeEventListener("dragstart", handleDragStart, { capture: true });
    if (devToolsChecker) clearInterval(devToolsChecker);
  };
}
