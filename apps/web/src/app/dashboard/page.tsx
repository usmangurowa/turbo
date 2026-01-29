"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";

import { Button } from "@turbo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@turbo/ui/card";
import { Skeleton } from "@turbo/ui/skeleton";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <main className="container flex min-h-0 flex-1 flex-col gap-6 py-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="container flex min-h-0 flex-1 flex-col items-center justify-center gap-4 py-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Sign in to access your dashboard.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Go to login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container flex min-h-0 flex-1 flex-col gap-6 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          You are signed in as {session.user.email}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Auth-only starter</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            This dashboard is kept intentionally minimal while auth is the
            primary feature. Add your own product modules here.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
