"use client";

import type { ReactNode } from "react";
import DetailBlock from "@/components/ui/detail-block";

type FieldBlockProps = {
  label: string;
  counter?: string;
  children: ReactNode;
  className?: string;
};

export default function FieldBlock({
  label,
  counter,
  children,
  className,
}: FieldBlockProps) {
  return (
    <DetailBlock label={label} meta={counter} className={className}>
      {children}
    </DetailBlock>
  );
}
