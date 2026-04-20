"use client";

import { Box, Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import CreatedEventsList from "@/features/profile/components/created-events-list";
import EditProfileForm from "@/features/profile/components/edit-profile-form";
import ProfileHeader from "@/features/profile/components/profile-header";
import ProfileInfoCard from "@/features/profile/components/profile-info-card";
import { useProfile } from "@/features/profile/hooks/use-profile";

export default function ProfilePage() {
  const { profile, isLoading, error } = useProfile();

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
    <Box p="4">
      <Flex direction="column" gap="5">
        <Box>
          <Heading size="6">Profile</Heading>
          <Text color="gray">
            Gestisci il tuo profilo e i tuoi eventi creati.
          </Text>
        </Box>

        <ProfileHeader profile={profile} />

        <Flex
          direction={{ initial: "column", xl: "row" }}
          gap="4"
          align="start"
        >
          <div className="w-full xl:max-w-[420px]">
            <Flex direction="column" gap="4">
              <ProfileInfoCard profile={profile} />
              <EditProfileForm profile={profile} />
            </Flex>
          </div>

          <div className="w-full">
            <Flex direction="column" gap="3">
              <Box>
                <Heading size="5">Eventi creati</Heading>
                <Text color="gray">
                  Qui trovi gli eventi che hai pubblicato e il punto per crearne
                  uno nuovo.
                </Text>
              </Box>

              <CreatedEventsList />
            </Flex>
          </div>
        </Flex>
      </Flex>
    </Box>
  );
}
