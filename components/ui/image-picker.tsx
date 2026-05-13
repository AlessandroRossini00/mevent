"use client";

import { Pencil2Icon } from "@radix-ui/react-icons";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import ImagePreviewDialog from "@/components/ui/image-preview-dialog";

type ImagePickerVariant = "event" | "profile";

type ImagePickerProps = {
  variant?: ImagePickerVariant;
  src?: string | null;
  alt: string;
  inputName?: string;
  fallback?: string;
  emptyText?: string;
  sizes?: string;
  aspectClassName?: string;
  size?: number;
  dialogTitle?: string;
  helperText?: string;
  onFileChange?: (file: File) => void;
};

export default function ImagePicker({
  variant = "event",
  src = null,
  alt,
  inputName = "image",
  fallback = "IMG",
  emptyText = "Nessuna immagine selezionata",
  sizes = "(max-width: 768px) 100vw, 720px",
  aspectClassName = "aspect-[16/10]",
  size = 96,
  dialogTitle = "Anteprima immagine",
  helperText,
  onFileChange,
}: ImagePickerProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(src);

  useEffect(() => {
    setPreviewSrc(src);
  }, [src]);

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
    setPreviewSrc(objectUrl);
    onFileChange?.(file);
  };

  const isProfile = variant === "profile";

  return (
    <Flex
      direction="column"
      align={isProfile ? "center" : "stretch"}
      gap="2"
      className={isProfile ? "w-fit" : "w-full"}
    >
      <input
        ref={inputRef}
        name={inputName}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          handleSelectFile(file);
        }}
      />

      <ImagePreviewDialog
        variant={variant}
        src={previewSrc}
        alt={alt}
        dialogTitle={dialogTitle}
        emptyText={emptyText}
        fallback={fallback}
        sizes={sizes}
        aspectClassName={aspectClassName}
        size={size}
        overlay={
          <IconButton
            type="button"
            radius="full"
            size={isProfile ? "2" : "3"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              inputRef.current?.click();
            }}
          >
            <Pencil2Icon />
          </IconButton>
        }
      />

      {helperText ? (
        <Text size="1" color="gray" align={isProfile ? "center" : "left"}>
          {helperText}
        </Text>
      ) : null}
    </Flex>
  );
}
