"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, Pencil2Icon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";
import { Box, IconButton, Text } from "@radix-ui/themes";

type PreviewImage = {
  src: string;
  width: number;
  height: number;
};

type EventImagePickerProps = {
  name?: string;
  defaultUrl?: string | null;
  onFileChange?: (file: File | null) => void;
};

export default function EventImagePicker({
  name = "event_image",
  defaultUrl = null,
  onFileChange,
}: EventImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const [preview, setPreview] = useState<PreviewImage | null>(
    defaultUrl
      ? {
          src: defaultUrl,
          width: 1200,
          height: 800,
        }
      : null,
  );

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleSelectFile = (file: File) => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    const img = new window.Image();
    img.onload = () => {
      setPreview({
        src: objectUrl,
        width: img.width,
        height: img.height,
      });
    };
    img.src = objectUrl;

    onFileChange?.(file);
  };

  return (
    <Box>
      <input
        ref={inputRef}
        name={name}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0] ?? null;
          if (!file) return;
          handleSelectFile(file);
        }}
      />

      <Dialog.Root>
        <Box className="relative overflow-hidden rounded-2xl border border-black/8 bg-black/[0.02]">
          <Dialog.Trigger asChild>
            <button
              type="button"
              className="relative block aspect-[16/10] w-full overflow-hidden"
            >
              {preview ? (
                <Image
                  src={preview.src}
                  alt="Immagine evento"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                  unoptimized
                />
              ) : (
                // Modificato questo box con il testo e lo stile
                <Box className="flex items-center justify-center">
                  <Text color="gray">Nessuna immagine selezionata</Text>
                </Box>
              )}
            </button>
          </Dialog.Trigger>

          <Box className="absolute right-3 bottom-3 z-10">
            <IconButton
              type="button"
              radius="full"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <Pencil2Icon />
            </IconButton>
          </Box>
        </Box>

        <Text size="1" color="gray" mt="2">
          Tocca l&apos;immagine per l&apos;anteprima o la matita per cambiarla
        </Text>

        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-auto max-w-none -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 shadow-none focus:outline-none">
            <Dialog.Title className="sr-only">
              Anteprima immagine evento
            </Dialog.Title>

            <Box position="relative">
              {preview ? (
                <Image
                  src={preview.src}
                  alt="Anteprima immagine evento"
                  width={preview.width}
                  height={preview.height}
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
                  <Text>Nessuna immagine selezionata</Text>
                </Box>
              )}

              <Box className="absolute top-3 right-3">
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
    </Box>
  );
}
