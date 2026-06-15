"use client";

import { motion } from "framer-motion";
import type { ComponentProps } from "react";

type Props = ComponentProps<typeof motion.div> & {
  delay?: number;
};

export function MotionSection({ delay = 0, ...props }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      {...props}
    />
  );
}
