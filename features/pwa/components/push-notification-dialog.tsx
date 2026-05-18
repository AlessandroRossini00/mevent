"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button, Flex, Text } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import { usePushNotificationsStore } from "@/features/pwa/store/push-notifications";

type PushNotificationPromptDialogProps = {
  storageKey?: string;
};

//TODO da modificare la grafica

export default function PushNotificationDialog({
  storageKey = "push_prompt_dismissed",
}: PushNotificationPromptDialogProps) {
  const [open, setOpen] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const isSupported = usePushNotificationsStore((state) => state.isSupported);
  const isInitialized = usePushNotificationsStore(
    (state) => state.isInitialized,
  );
  const isPending = usePushNotificationsStore((state) => state.isPending);
  const permission = usePushNotificationsStore((state) => state.permission);
  const subscription = usePushNotificationsStore((state) => state.subscription);
  const syncSubscription = usePushNotificationsStore(
    (state) => state.syncSubscription,
  );
  const subscribeToPush = usePushNotificationsStore(
    (state) => state.subscribeToPush,
  );

  useEffect(() => {
    void syncSubscription();
  }, [syncSubscription]);

  useEffect(() => {
    if (!isSupported || !isInitialized) return;
    if (subscription || permission === "denied") return;

    const dismissed = window.localStorage.getItem(storageKey);

    if (!dismissed) {
      setOpen(true);
    }
  }, [isSupported, isInitialized, subscription, permission, storageKey]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      window.localStorage.setItem(storageKey, "true");
    }
  };

  const handleEnable = async () => {
    setLocalError(null);

    const success = await subscribeToPush();

    if (success) {
      setOpen(false);
      return;
    }

    setLocalError("Non è stato possibile attivare le notifiche.");
  };

  if (
    !isSupported ||
    !isInitialized ||
    subscription ||
    permission === "denied"
  ) {
    return null;
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-32px)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-6 shadow-xl focus:outline-none">
          <Dialog.Title
            color="blue"
            className="text-lg font-semibold"
            style={{ color: "blue" }}
          >
            Attiva le notifiche
          </Dialog.Title>

          <Text as="p" color="gray" mt="2">
            Attiva le notifiche per ricevere aggiornamenti in tempo reale sui
            nuovi messaggi e non perdere nulla!
          </Text>

          {localError ? (
            <Text as="p" color="red" mt="3">
              {localError}
            </Text>
          ) : null}

          <Flex gap="3" mt="5" justify="center">
            <Button
              variant="soft"
              color="red"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Non attivare
            </Button>

            <Button
              variant="soft"
              color="green"
              onClick={handleEnable}
              loading={isPending}
            >
              Attiva
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
