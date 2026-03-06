import { useState, useRef, useEffect } from "preact/hooks";

export function useSwipeable(pageCount: number) {
  const [activePage, setActivePage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startScrollLeft, setStartScrollLeft] = useState(0);
  const walkRef = useRef(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const width = scrollRef.current.clientWidth;
      const pageIndex = Math.round(scrollLeft / width);
      setActivePage(pageIndex);
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!scrollRef.current) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setStartScrollLeft(scrollRef.current.scrollLeft);
    scrollRef.current.style.scrollSnapType = "none";
    walkRef.current = 0;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = x - startX;
    walkRef.current = walk;
    scrollRef.current.scrollLeft = startScrollLeft - walk;
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (!isDragging || !scrollRef.current) return;
    setIsDragging(false);
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);

    const width = scrollRef.current.clientWidth;
    const startPage = Math.round(startScrollLeft / width);
    let targetPage = startPage;

    if (Math.abs(walkRef.current) > 50) {
      const direction = walkRef.current < 0 ? 1 : -1;
      targetPage = Math.max(0, Math.min(startPage + direction, pageCount - 1));
    }

    scrollRef.current.scrollTo({
      left: targetPage * width,
      behavior: "smooth",
    });

    const ref = scrollRef.current;
    const restoreSnap = () => {
      ref.style.scrollSnapType = "";
      ref.removeEventListener("scrollend", restoreSnap);
    };

    ref.addEventListener("scrollend", restoreSnap);
    setTimeout(restoreSnap, 500);
  };

  useEffect(() => {
    handleScroll();
  }, []);

  return {
    activePage,
    scrollRef,
    isDragging,
    scrollHandlers: {
      onScroll: handleScroll,
    },
    dragHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
