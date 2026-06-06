"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "..";

interface TypingAnimationProps {
  /** Text content to type */
  children: string;
  /** Optional CSS class */
  className?: string;
  /** Typing speed in milliseconds per character */
  typeSpeed?: number;
  /** Delay before starting in milliseconds */
  delay?: number;
  /** Element type to render */
  as?: React.ElementType;
  /** Whether to show cursor */
  showCursor?: boolean;
  /** Whether cursor should blink */
  blinkCursor?: boolean;
  /** Callback when typing completes */
  onComplete?: () => void;
  /** Whether to start animation when element comes into view */
  startOnView?: boolean;
}

/**
 * TypingAnimation - Displays text with a typewriter animation effect.
 *
 * @example
 * ```tsx
 * <TypingAnimation onComplete={() => setShowContent(true)}>
 *   Hello World!
 * </TypingAnimation>
 * ```
 */
export const TypingAnimation = ({
  children,
  className,
  typeSpeed = 50,
  delay = 0,
  as: Component = "span",
  showCursor = true,
  blinkCursor = true,
  onComplete,
  startOnView = true,
}: TypingAnimationProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [hasStarted, setHasStarted] = useState(!startOnView);
  const [isComplete, setIsComplete] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Start animation when in view
  useEffect(() => {
    if (!startOnView || hasStarted) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView, hasStarted]);

  // Run typing animation
  useEffect(() => {
    if (!hasStarted || isComplete) return;

    const text = children;
    let currentIndex = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const timeoutId = setTimeout(() => {
      intervalId = setInterval(() => {
        if (currentIndex <= text.length) {
          setDisplayedText(text.slice(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(intervalId);
          setIsComplete(true);
          onComplete?.();
        }
      }, typeSpeed);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [hasStarted, isComplete, children, typeSpeed, delay, onComplete]);

  return (
    <Component
      ref={ref}
      className={cn("inline-block", className)}
      aria-label={children}
    >
      {displayedText}
      {showCursor && !isComplete && (
        <span
          className={cn(
            "ml-0.5 inline-block h-[1em] w-[2px] bg-current align-middle",
            blinkCursor && "animate-blink",
          )}
          aria-hidden="true"
        />
      )}
    </Component>
  );
};
