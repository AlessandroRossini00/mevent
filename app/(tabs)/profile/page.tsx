// app/(tabs)/home/page.tsx
"use client";
import Link from "next/link";
import { List } from "@/components/ui/List";
import { Button, Card, Box, Flex, Text, Avatar } from "@radix-ui/themes";
import { logout } from "@/features/auth/services/login-actions";

import { useAuth } from "@/features/auth/hook/use-auth";

export default function ExplorePage() {
  const { user, profile, isHydrated } = useAuth();

  return (
    <div>
      <h1>PROFILE</h1>
      <List
        orientation="horizontal"
        items={["Music", "Sport", "Tech", "Food"]}
        renderItem={(label) => (
          <button className="rounded-full border px-4 py-2 whitespace-nowrap">
            {label}
          </button>
        )}
      />
      <Box maxWidth="240px">
        <Card>
          <Flex
            gap="3"
            align="center"
            direction={"column"}
            style={{ backgroundColor: "red" }}
          >
            <Avatar
              size="3"
              src="https://images.unsplash.com/photo-1607346256330-dee7af15f7c5?&w=64&h=64&dpr=2&q=70&crop=focalpoint&fp-x=0.67&fp-y=0.5&fp-z=1.4&fit=crop"
              radius="full"
              fallback="T"
            />
            <Box>
              <Text as="div" size="2" weight="bold">
                {profile?.full_name}
              </Text>
              <Text
                as="div"
                size="2"
                color="gray"
                style={{ backgroundColor: "orange" }}
              >
                {user?.email}
              </Text>
            </Box>
          </Flex>
        </Card>
      </Box>

      <Button onClick={() => logout()}>Logout</Button>
    </div>
  );
}
