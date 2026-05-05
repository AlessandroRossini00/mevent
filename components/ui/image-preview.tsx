"use client";

import Image from "next/image";
import { Flex, Text } from "@radix-ui/themes";

type ImagePreviewProps = {
  src?: string | null;
  alt: string;
  sizes?: string;
  emptyText?: string;
  className?: string;
  imageClassName?: string;
};

export default function ImagePreview({
  src,
  alt,
  sizes = "(max-width: 768px) 100vw, 50vw",
  emptyText = "Nessuna immagine",
  className = "relative h-full w-full overflow-hidden bg-zinc-100",
  imageClassName = "object-cover",
}: ImagePreviewProps) {
  return (
    <div className={className}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className={imageClassName}
          sizes={sizes}
          unoptimized
        />
      ) : (
        <Flex align="center" justify="center" className="h-full w-full">
          <Text color="gray">{emptyText}</Text>
        </Flex>
      )}
    </div>
  );
}
