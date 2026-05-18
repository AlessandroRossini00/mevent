"use client";

import { create } from "zustand";
import {
  subscribeUser,
  unsubscribeUser,
} from "@/features/pwa/services/actions";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
}

function serializeSubscription(subscription: PushSubscription) {
  return JSON.parse(JSON.stringify(subscription));
}

type PushNotificationsStore = {
  subscription: PushSubscription | null;
  isPending: boolean;
  isInitialized: boolean;
  isSupported: boolean;
  permission: NotificationPermission | "unsupported";
  syncSubscription: () => Promise<void>;
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
};

export const usePushNotificationsStore = create<PushNotificationsStore>(
  (set, get) => ({
    subscription: null,
    isPending: false,
    isInitialized: false,
    isSupported:
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window,
    permission:
      typeof window !== "undefined" && "Notification" in window
        ? Notification.permission
        : "unsupported",

    syncSubscription: async () => {
      const { isSupported } = get();

      if (!isSupported) {
        set({
          isInitialized: true,
          permission: "unsupported",
          subscription: null,
        });
        return;
      }

      try {
        set({ isPending: true });

        const registration = await navigator.serviceWorker.ready;
        const existingSubscription =
          await registration.pushManager.getSubscription();

        set({
          subscription: existingSubscription,
          permission: Notification.permission,
          isInitialized: true,
        });

        if (existingSubscription) {
          await subscribeUser(serializeSubscription(existingSubscription));
        }
      } catch (error) {
        console.error("Errore sync push subscription", error);
        set({
          isInitialized: true,
          permission: Notification.permission,
        });
      } finally {
        set({ isPending: false });
      }
    },

    subscribeToPush: async () => {
      const { isSupported } = get();

      if (!isSupported) return false;

      try {
        set({ isPending: true });

        const permission = await Notification.requestPermission();

        set({ permission });

        if (permission !== "granted") {
          return false;
        }

        const registration = await navigator.serviceWorker.ready;

        let subscription = await registration.pushManager.getSubscription();

        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
              process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            ),
          });
        }

        await subscribeUser(serializeSubscription(subscription));

        set({
          subscription,
          permission,
          isInitialized: true,
        });

        return true;
      } catch (error) {
        console.error("Errore subscribe push", error);
        return false;
      } finally {
        set({ isPending: false });
      }
    },

    unsubscribeFromPush: async () => {
      const { subscription } = get();

      if (!subscription) return false;

      try {
        set({ isPending: true });

        await subscription.unsubscribe();
        await unsubscribeUser(subscription.endpoint);

        set({
          subscription: null,
          permission: Notification.permission,
        });

        return true;
      } catch (error) {
        console.error("Errore unsubscribe push", error);
        return false;
      } finally {
        set({ isPending: false });
      }
    },
  }),
);
