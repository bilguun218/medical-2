"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export function MotionReveal({ className, transition, viewport, ...props }: HTMLMotionProps<"div">) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className={cn("motion-reveal", className)}
      initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
      animate={shouldReduceMotion ? { opacity: 1, y: 0 } : undefined}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={shouldReduceMotion ? undefined : viewport ?? { once: true, amount: 0.14, margin: "0px 0px -48px 0px" }}
      transition={shouldReduceMotion ? undefined : transition ?? { duration: 0.2, ease: "easeOut" }}
      {...props}
    />
  );
}
