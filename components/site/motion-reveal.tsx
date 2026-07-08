import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type MotionRevealProps = HTMLAttributes<HTMLDivElement> & {
  transition?: unknown;
  viewport?: unknown;
};

export function MotionReveal({ className, transition: _transition, viewport: _viewport, ...props }: MotionRevealProps) {
  void _transition;
  void _viewport;

  return <div className={cn("motion-reveal", className)} {...props} />;
}
