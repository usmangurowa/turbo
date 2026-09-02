import { View } from "react-native";
import { Link } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { Text } from "@/components/ui/text";
import { api } from "@/utils/api";
import { useQuery } from "@tanstack/react-query";

const sampleTasks = [
  {
    id: "TSK-341",
    title: "Review onboarding funnel drop-off",
    status: "in-progress",
  },
  {
    id: "TSK-338",
    title: "Ship dark mode contrast fixes",
    status: "completed",
  },
  {
    id: "TSK-334",
    title: "Escalate billing webhook retries",
    status: "escalated",
  },
  {
    id: "TSK-330",
    title: "Draft Q1 analytics report",
    status: "in-progress",
  },
];

export default function HomeScreen() {
  const { data } = useQuery({
    queryKey: ["session"],
    queryFn: () => authClient.getSession(),
  });

  const { data: apiTasks } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await api.tasks.$get();
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const { tasks } = await res.json();
      return tasks;
    },
  });

  // Fall back to sample data when the API returns no rows (zero-env template).
  const taskList = apiTasks && apiTasks.length > 0 ? apiTasks : sampleTasks;

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
          <Card className="flex-1 items-center gap-3 py-4">
            <CardHeader className="items-center px-4">
              <CardTitle className="text-muted-foreground text-sm">
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <Text className="text-3xl font-bold">0</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 items-center gap-3 py-4">
            <CardHeader className="items-center px-4">
              <CardTitle className="text-muted-foreground text-sm">
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <Text className="text-3xl font-bold">0</Text>
            </CardContent>
          </Card>
          <Card className="flex-1 items-center gap-3 py-4">
            <CardHeader className="items-center px-4">
              <CardTitle className="text-muted-foreground text-sm">
                Members
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4">
              <Text className="text-3xl font-bold">0</Text>
            </CardContent>
          </Card>
        </View>

        <View className="mt-8 gap-3">
          <Text className="text-lg font-semibold">Recent tasks</Text>
          {taskList.map((task) => (
            <Card key={task.id} className="flex-row items-center gap-2 py-3">
              <CardHeader className="flex-1 px-4">
                <CardTitle className="text-sm" numberOfLines={1}>
                  {task.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pr-4 pl-0">
                <Text className="text-muted-foreground text-xs capitalize">
                  {task.status}
                </Text>
              </CardContent>
            </Card>
          ))}
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
