"use client";

import { useEffect, useState } from "react";
import { Button, Card, Flex, Text, TextField } from "@radix-ui/themes";
import {
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "@/features/pwa/services/actions";

// TODO gestire errore di reload, togliere scroll a delle pagine
// Ho notato che dopo aver chattato e tornato indietro c'è ancora il numerino
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );
  const [message, setMessage] = useState("");

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  useEffect(() => {
    if (!isSupported) return;

    const registerServiceWorker = async () => {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      });

      const existingSubscription =
        await registration.pushManager.getSubscription();

      setSubscription(existingSubscription);
    };

    void registerServiceWorker();
  }, [isSupported]);

  async function subscribeToPush() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;

    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      ),
    });

    setSubscription(sub);

    console.log(sub);

    const serializedSub = JSON.parse(JSON.stringify(sub));
    await subscribeUser(serializedSub);
  }

  async function unsubscribeFromPush() {
    if (!subscription) return;

    await subscription.unsubscribe();
    await unsubscribeUser(subscription.endpoint);
    setSubscription(null);
  }

  async function sendTestNotification() {
    if (!subscription) return;

    await sendNotification(message);
    setMessage("");
  }

  if (!isSupported) {
    return (
      <Card size="3">
        <Text>Push notifications non supportate in questo browser.</Text>
      </Card>
    );
  }

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Text size="4" weight="medium">
          Notifiche
        </Text>

        {subscription ? (
          <>
            <Text color="gray">Notifiche attive.</Text>

            <Flex gap="2" wrap="wrap">
              <Button variant="soft" onClick={unsubscribeFromPush}>
                Disattiva notifiche
              </Button>
            </Flex>

            <TextField.Root
              placeholder="Inserisci un messaggio di test"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />

            <Button onClick={sendTestNotification}>
              Invia notifica di prova
            </Button>
          </>
        ) : (
          <>
            <Text color="gray">Notifiche non attive.</Text>
            <Button onClick={subscribeToPush}>Attiva notifiche</Button>
          </>
        )}
      </Flex>
    </Card>
  );
}
