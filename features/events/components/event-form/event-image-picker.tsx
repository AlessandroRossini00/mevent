"use client";

import { Pencil2Icon } from "@radix-ui/react-icons";
import { IconButton, Text } from "@radix-ui/themes";
import { useEffect, useRef, useState } from "react";
import ImagePreviewDialog from "@/components/ui/image-preview-dialog";

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
  const [previewSrc, setPreviewSrc] = useState<string | null>(defaultUrl);

  useEffect(() => {
    setPreviewSrc(defaultUrl);
  }, [defaultUrl]);

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

  return (
    <div>
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

      <ImagePreviewDialog
        src={previewSrc}
        alt="Immagine evento"
        dialogTitle="Anteprima immagine evento"
        emptyText="Nessuna immagine selezionata"
        sizes="(max-width: 768px) 100vw, 720px"
        aspectClassName="aspect-[16/10]"
        overlay={
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
        }
      />

      <Text size="1" color="gray" mt="2">
        Tocca l&apos;immagine per l&apos;anteprima o la matita per cambiarla
      </Text>
    </div>
  );
}
