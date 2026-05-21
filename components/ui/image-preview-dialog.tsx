"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Box, IconButton, Spinner } from "@radix-ui/themes";

type ImagePreviewVariant = "event" | "profile";

type ImagePreviewDialogProps = {
  variant?: ImagePreviewVariant;
  src?: string | null;
  alt: string;
  dialogTitle?: string;
  emptyText?: string;
  fallback?: string;
  sizes?: string;
  aspectClassName?: string;
  size?: number;
  overlay?: React.ReactNode;
  onLoad?: () => void;
};

export default function ImagePreviewDialog({
  variant = "event",
  src = null,
  alt,
  dialogTitle = "Anteprima immagine",
  emptyText = "Nessuna immagine selezionata",
  fallback = "IMG",
  sizes = "(max-width: 768px) 100vw, 720px",
  aspectClassName = "aspect-[16/10]",
  size = 96,
  overlay,
  onLoad,
}: ImagePreviewDialogProps) {
  const [open, setOpen] = useState(false);
  const [isDialogImageLoading, setIsDialogImageLoading] = useState(
    Boolean(src),
  );

  const isProfile = variant === "profile";

  // La stessa componente supporta due layout:
  // preview rettangolare per eventi e preview circolare per avatar profilo.
  const outerClassName = isProfile ? "relative inline-block p-2" : "relative";
  const containerClassName = isProfile
    ? "relative overflow-hidden rounded-full border border-black/8 bg-black/[0.02]"
    : "relative overflow-hidden border border-black/8 bg-black/[0.02]";

  const triggerClassName = isProfile
    ? "relative block h-full w-full overflow-hidden rounded-full"
    : `relative block w-full overflow-hidden ${aspectClassName}`;

  const triggerStyle = isProfile
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  const imageClassName = isProfile
    ? "object-cover rounded-full"
    : "object-cover";

  const fallbackNode = (
    <Box className="absolute inset-0 bg-zinc-100">
      <Image
        src="/placeholder.png"
        alt=""
        fill
        className="object-contain p-6 opacity-70"
      />
    </Box>
  );

  // Il bottone chiudi compare solo quando l'immagine del dialog è pronta
  // oppure quando non esiste alcuna immagine da mostrare.
  const showCloseButton = !src || !isDialogImageLoading;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);

        // Ogni volta che il dialog si apre resettiamo lo stato loading
        // dell'immagine fullscreen, così lo spinner resta coerente anche su riaperture.
        if (nextOpen) {
          setIsDialogImageLoading(Boolean(src));
        }
      }}
    >
      <Box className={outerClassName}>
        <Box className={containerClassName} style={triggerStyle}>
          <Dialog.Trigger asChild>
            <button type="button" className={triggerClassName}>
              {src ? (
                <Image
                  src={src}
                  alt={alt}
                  fill
                  className={imageClassName}
                  sizes={isProfile ? `${size}px` : sizes}
                  // onLoad viene esposto al parent per gestire eventuali spinner
                  // o stato esterno sulla preview inline.
                  onLoad={onLoad}
                />
              ) : (
                fallbackNode
              )}
            </button>
          </Dialog.Trigger>
        </Box>

        {overlay ? (
          <Box
            position="absolute"
            right="12px"
            bottom="12px"
            style={{ zIndex: 20 }}
          >
            {overlay}
          </Box>
        ) : null}
      </Box>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 shadow-none focus:outline-none">
          <Dialog.Title className="sr-only">{dialogTitle}</Dialog.Title>

          <Box position="relative" className="inline-block">
            {src ? (
              <>
                {isDialogImageLoading ? (
                  <Box className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/20">
                    <Spinner size="3" />
                  </Box>
                ) : null}

                <Image
                  src={src}
                  alt={alt}
                  width={1200}
                  height={800}
                  unoptimized
                  onLoad={() => setIsDialogImageLoading(false)}
                  onError={() => setIsDialogImageLoading(false)}
                  style={{
                    maxWidth: "92vw",
                    maxHeight: "85vh",
                    width: "auto",
                    height: "auto",
                    borderRadius: "16px",
                    display: "block",
                  }}
                />
              </>
            ) : (
              <Box className="rounded-xl bg-white p-8">
                {isProfile ? fallback : emptyText}
              </Box>
            )}

            {showCloseButton ? (
              <Box className="absolute right-3 top-3 z-10">
                <Dialog.Close asChild>
                  <IconButton radius="full" variant="solid" color="gray">
                    <Cross2Icon />
                  </IconButton>
                </Dialog.Close>
              </Box>
            ) : null}
          </Box>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
