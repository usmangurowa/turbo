import { View } from "react-native";
import { Link } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { useQuery } from "@tanstack/react-query";

export default function HomeScreen() {
  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  if (!data?.data) {
    return null;
  }
  return (
    <Container>
      <View className="flex-1 p-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold">
            Welcome {data.data.user.name}!
          </Text>
          <Text className="text-muted-foreground mt-1">
            You have successfully completed the onboarding flow.
          </Text>
        </View>

        <View className="flex-row gap-4">
          <Card className="flex-1 items-center p-4">
            <Text className="text-3xl font-bold">0</Text>
            <Text className="text-muted-foreground text-sm">Projects</Text>
          </Card>
          <Card className="flex-1 items-center p-4">
            <Text className="text-3xl font-bold">0</Text>
            <Text className="text-muted-foreground text-sm">Tasks</Text>
          </Card>
          <Card className="flex-1 items-center p-4">
            <Text className="text-3xl font-bold">0</Text>
            <Text className="text-muted-foreground text-sm">Members</Text>
          </Card>
        </View>

        <View className="mt-8">
          <Link href={"/(auth)/login"} asChild>
            <Button variant="outline">Logout</Button>
          </Link>
        </View>
      </View>
    </Container>
  );
}
