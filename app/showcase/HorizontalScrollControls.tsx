"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface HorizontalScrollControlsProps {
  label: string;
  targetId: string;
}

export function HorizontalScrollControls({
  label,
  targetId,
}: HorizontalScrollControlsProps) {
  const [availability, setAvailability] = useState({ previous: false, next: false });
  const updateAvailability = useCallback(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const maxScrollLeft = target.scrollWidth - target.clientWidth;
    setAvailability({
      previous: target.scrollLeft > 1,
      next: maxScrollLeft > 1 && target.scrollLeft < maxScrollLeft - 1,
    });
  }, [targetId]);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const animationFrame = window.requestAnimationFrame(updateAvailability);
    target.addEventListener("scroll", updateAvailability, { passive: true });
    window.addEventListener("resize", updateAvailability);
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(updateAvailability);
    observer?.observe(target);
    return () => {
      window.cancelAnimationFrame(animationFrame);
      target.removeEventListener("scroll", updateAvailability);
      window.removeEventListener("resize", updateAvailability);
      observer?.disconnect();
    };
  }, [targetId, updateAvailability]);

  return (
    <div
      className="prototype-horizontal-controls"
      role="group"
      aria-label={`${label} 가로 이동`}
    >
      <ScrollButton
        direction="previous"
        disabled={!availability.previous}
        label={label}
        targetId={targetId}
      />
      <ScrollButton
        direction="next"
        disabled={!availability.next}
        label={label}
        targetId={targetId}
      />
    </div>
  );
}

function ScrollButton({
  direction,
  disabled,
  label,
  targetId,
}: HorizontalScrollControlsProps & {
  direction: "previous" | "next";
  disabled: boolean;
}) {
  const isPrevious = direction === "previous";
  const buttonLabel = `${label} ${isPrevious ? "왼쪽" : "오른쪽"}으로 이동`;
  const Icon = isPrevious ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-controls={targetId}
      aria-label={buttonLabel}
      disabled={disabled}
      title={buttonLabel}
      onClick={() => scrollTarget(targetId, isPrevious ? -1 : 1)}
    >
      <Icon size={17} aria-hidden="true" />
    </button>
  );
}

function scrollTarget(targetId: string, direction: -1 | 1) {
  const target = document.getElementById(targetId);
  if (!target) return;
  const distance = Math.max(target.clientWidth * 0.85, 280);
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  target.scrollBy({
    left: distance * direction,
    behavior: reduceMotion ? "auto" : "smooth",
  });
}
