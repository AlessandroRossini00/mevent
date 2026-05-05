"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Box, IconButton, Text } from "@radix-ui/themes";

type ImagePreviewDialogProps = {
  src?: string | null;
  alt: string;
  dialogTitle?: string;
  emptyText?: string;
  sizes?: string;
  aspectClassName?: string;
  overlay?: React.ReactNode;
};

export default function ImagePreviewDialog({
  src,
  alt,
  dialogTitle = "Anteprima immagine",
  emptyText = "Nessuna immagine selezionata",
  sizes = "(max-width: 768px) 100vw, 720px",
  aspectClassName = "aspect-[16/10]",
  overlay,
}: ImagePreviewDialogProps) {
  return (
    <Dialog.Root>
      <Box className="relative overflow-hidden border border-black/8 bg-black/[0.02]">
        <Dialog.Trigger asChild>
          <button
            type="button"
            className={`relative block w-full overflow-hidden ${aspectClassName}`}
          >
            {src ? (
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes={sizes}
                unoptimized
              />
            ) : (
              <Box className="absolute inset-0 flex items-center justify-center bg-zinc-100 text-center">
                <Text color="gray">{emptyText}</Text>
              </Box>
            )}
          </button>
        </Dialog.Trigger>

        {overlay ? (
          <Box className="absolute bottom-3 right-3 z-10">{overlay}</Box>
        ) : null}
      </Box>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-auto max-w-none -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 shadow-none focus:outline-none">
          <Dialog.Title className="sr-only">{dialogTitle}</Dialog.Title>

          <Box position="relative">
            {src ? (
              <Image
                src={src}
                alt={alt}
                width={1200}
                height={800}
                unoptimized
                style={{
                  maxWidth: "92vw",
                  maxHeight: "85vh",
                  width: "auto",
                  height: "auto",
                  borderRadius: "16px",
                  display: "block",
                }}
              />
            ) : (
              <Box className="rounded-xl bg-white p-8">
                <Text>{emptyText}</Text>
              </Box>
            )}

            <Box className="absolute right-3 top-3">
              <Dialog.Close asChild>
                <IconButton radius="full" variant="solid" color="gray">
                  <Cross2Icon />
                </IconButton>
              </Dialog.Close>
            </Box>
          </Box>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
