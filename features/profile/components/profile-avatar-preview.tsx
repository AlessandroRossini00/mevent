"use client";

import Image from "next/image";
import * as Dialog from "@radix-ui/react-dialog";
import { Cross2Icon, Pencil2Icon } from "@radix-ui/react-icons";
import { useRef, useState } from "react";
import { Box, IconButton } from "@radix-ui/themes";

type PreviewImage = {
  src: string;
  width: number;
  height: number;
};

type ProfileAvatarPreviewProps = {
  src: string | null;
  alt: string;
  fallback: string;
  size?: number;
  editable?: boolean;
  inputName?: string;
  onFileChange?: (file: File) => void;
};

export default function ProfileAvatarPreview({
  src,
  alt,
  fallback,
  size = 96,
  editable = false,
  inputName = "avatar",
  onFileChange,
}: ProfileAvatarPreviewProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<PreviewImage | null>(
    src
      ? {
          src,
          width: 800,
          height: 800,
        }
      : null,
  );

  const handleFileChange = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
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
    <Dialog.Root>
      {editable ? (
        <input
          ref={inputRef}
          name={inputName}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            handleFileChange(file);
          }}
        />
      ) : null}

      <Box position="relative" width={`${size}px`} height={`${size}px`}>
        <Dialog.Trigger asChild>
          <button
            type="button"
            className="block h-full w-full overflow-hidden rounded-full"
          >
            {preview ? (
              <Box className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={preview.src}
                  alt={alt}
                  fill
                  className="object-cover"
                  sizes={`${size}px`}
                  unoptimized
                />
              </Box>
            ) : (
              <Box className="flex h-full w-full items-center justify-center rounded-full bg-zinc-200 text-xl font-medium">
                {fallback}
              </Box>
            )}
          </button>
        </Dialog.Trigger>

        {editable ? (
          <Box position="absolute" right="0" bottom="0" style={{ zIndex: 20 }}>
            <IconButton
              type="button"
              size="2"
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
        ) : null}
      </Box>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/70" />

        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-auto max-w-none -translate-x-1/2 -translate-y-1/2 bg-transparent p-0 shadow-none focus:outline-none">
          <Dialog.Title className="sr-only">
            Anteprima foto profilo
          </Dialog.Title>

          <Box position="relative">
            {preview ? (
              <Image
                src={preview.src}
                alt={alt}
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
              <Box className="rounded-xl bg-white p-8">{fallback}</Box>
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
  );
}
