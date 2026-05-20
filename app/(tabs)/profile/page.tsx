"use client";

import { useState } from "react";
import { Box, Flex, Spinner, Text } from "@radix-ui/themes";
import EditProfileForm from "@/features/profile/components/edit-profile-form";
import ProfileInfoCard from "@/features/profile/components/profile-info-card";
import { useProfile } from "@/features/profile/hooks/use-profile";
import PushNotificationSettings from "@/features/pwa/components/push-notification-settings";
import LogoutButton from "@/features/auth/components/logout-button";

export default function ProfilePage() {
  const { profile, isLoading, error } = useProfile();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return (
      <Flex minHeight="60vh" align="center" justify="center">
        <Spinner size="3" />
      </Flex>
    );
  }

  if (error || !profile) {
    return (
      <Box p="4">
        <Text color="red">{error ?? "Profilo non disponibile."}</Text>
      </Box>
    );
  }

  return (
    <Flex
      minHeight="100vh"
      align="center"
      justify="center"
      p="4"
      direction={"column"}
      gap={"6"}
    >
      <PushNotificationSettings />
      <Box className="w-full max-w-[720px]">
        {isEditing ? (
          <EditProfileForm
            profile={profile}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => setIsEditing(false)}
          />
        ) : (
          <ProfileInfoCard
            profile={profile}
            onEdit={() => setIsEditing(true)}
          />
        )}
      </Box>
      <LogoutButton />
    </Flex>
  );
}
