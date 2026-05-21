"use client";

import { useEffect } from "react";
import { Card, Flex, Switch, Text } from "@radix-ui/themes";
import { usePushNotificationsStore } from "@/features/pwa/store/push-notifications";

export default function PushNotificationSettings() {
  const isSupported = usePushNotificationsStore((state) => state.isSupported);
  const isInitialized = usePushNotificationsStore(
    (state) => state.isInitialized,
  );
  const isPending = usePushNotificationsStore((state) => state.isPending);
  const subscription = usePushNotificationsStore((state) => state.subscription);
  const syncSubscription = usePushNotificationsStore(
    (state) => state.syncSubscription,
  );
  const subscribeToPush = usePushNotificationsStore(
    (state) => state.subscribeToPush,
  );
  const unsubscribeFromPush = usePushNotificationsStore(
    (state) => state.unsubscribeFromPush,
  );

  useEffect(() => {
    // Alla prima apertura allineiamo lo stato locale con la subscription reale
    // del browser, così lo switch parte già coerente con il dispositivo.
    if (!isInitialized) {
      void syncSubscription();
    }
  }, [isInitialized, syncSubscription]);

  if (!isSupported) {
    return (
      <Card size="3">
        <Text>Push notifications non supportate in questo browser.</Text>
      </Card>
    );
  }

  const isEnabled = Boolean(subscription);

  const handleCheckedChange = async (checked: boolean) => {
    // Lo switch controlla direttamente la subscription push:
    // se attivo creiamo la registrazione, se spento la rimuoviamo.
    if (checked) {
      await subscribeToPush();
      return;
    }

    await unsubscribeFromPush();
  };

  return (
    <Card size="3">
      <Flex direction="column" gap="4">
        <Flex align="center" justify="between" gap="4">
          <div>
            <Text as="p" size="4" weight="medium">
              Notifiche
            </Text>
            <Text as="p" color="gray" size="2">
              Attiva o disattiva le notifiche push per i nuovi messaggi.
            </Text>
          </div>

          <Switch
            checked={isEnabled}
            // Evitiamo interazioni mentre stiamo sincronizzando o aggiornando
            // la subscription per non creare stati incoerenti nello switch.
            disabled={isPending || !isInitialized}
            onCheckedChange={handleCheckedChange}
          />
        </Flex>
      </Flex>
    </Card>
  );
}
