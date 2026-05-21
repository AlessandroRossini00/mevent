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
    // Se cambia l'immagine iniziale dall'esterno, riallineiamo anche la preview locale.
    setPreviewSrc(defaultUrl);
  }, [defaultUrl]);

  useEffect(() => {
    return () => {
      // Le preview create con URL.createObjectURL vanno liberate quando
      // il componente si smonta per evitare memory leak nel browser.
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

    // Mostriamo subito la preview locale del nuovo file selezionato
    // senza dover attendere upload o salvataggio sul server.
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
              // La matita vive sopra il trigger dell'anteprima:
              // blocchiamo quindi apertura dialog e click bubbling
              // per aprire invece il file picker.
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
