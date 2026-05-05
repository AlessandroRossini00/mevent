"use client";

import { Text } from "@radix-ui/themes";
import DetailBlock from "@/components/ui/detail-block";

type InfoBlockProps = {
  label: string;
  value: React.ReactNode;
  size?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  color?:
    | "gray"
    | "red"
    | "blue"
    | "green"
    | "amber"
    | "bronze"
    | "brown"
    | "crimson"
    | "cyan"
    | "gold"
    | "grass"
    | "indigo"
    | "iris"
    | "jade"
    | "lime"
    | "mint"
    | "orange"
    | "pink"
    | "plum"
    | "purple"
    | "ruby"
    | "sky"
    | "teal"
    | "tomato"
    | "violet";
  className?: string;
};

export default function InfoBlock({
  label,
  value,
  size = "2",
  color,
  className,
}: InfoBlockProps) {
  return (
    <DetailBlock label={label} className={className}>
      {typeof value === "string" || typeof value === "number" ? (
        <Text size={size} color={color}>
          {value}
        </Text>
      ) : (
        value
      )}
    </DetailBlock>
  );
}
