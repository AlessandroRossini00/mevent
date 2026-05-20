"use client";

import { useState } from "react";
import { Badge, Heading, Spinner } from "@radix-ui/themes";
import ImagePreviewDialog from "@/components/ui/image-preview-dialog";

type EventCardMediaProps = {
  cover: string | null;
  title: string;
  category?: string | null;
  statusBadge?: {
    label: string;
    color: "jade" | "blue" | "gray" | "red" | "amber";
  } | null;
};

export default function EventCardMedia({
  cover,
  title,
  category,
  statusBadge,
}: EventCardMediaProps) {
  const [isImageLoading, setIsImageLoading] = useState(Boolean(cover));

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
      {isImageLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-100/80">
          <Spinner size="3" />
        </div>
      ) : null}

      <ImagePreviewDialog
        src={cover}
        alt={title}
        dialogTitle={title}
        emptyText="Nessuna immagine"
        sizes="(max-width: 768px) 100vw, 50vw"
        aspectClassName="aspect-video"
        onLoad={() => setIsImageLoading(false)}
      />

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <Badge size="2" variant="solid" color="gray">
          {category ?? "Evento"}
        </Badge>

        {statusBadge ? (
          <Badge color={statusBadge.color} variant="solid" size="2">
            {statusBadge.label}
          </Badge>
        ) : null}
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
        <Heading size="4" className="text-white">
          {title}
        </Heading>
      </div>
    </div>
  );
}
