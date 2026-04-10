// Generato con AI
"use client";

import React from "react";

type Orientation = "vertical" | "horizontal";

type ListProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  orientation?: Orientation;
  className?: string;
  itemClassName?: string;
};

export function List<T>({
  items,
  renderItem,
  orientation = "vertical",
  className = "",
  itemClassName = "",
}: ListProps<T>) {
  const isHorizontal = orientation === "horizontal";

  return (
    <div
      className={[
        "w-full",
        isHorizontal
          ? "flex gap-3 overflow-x-auto overflow-y-hidden pb-2 snap-x snap-mandatory"
          : "flex flex-col gap-3",
        className,
      ].join(" ")}
      role="list"
    >
      {items.map((item, index) => (
        <div
          key={index}
          role="listitem"
          className={[
            isHorizontal ? "shrink-0 snap-start" : "",
            itemClassName,
          ].join(" ")}
        >
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
}
