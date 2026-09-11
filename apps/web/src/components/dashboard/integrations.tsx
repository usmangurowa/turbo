"use client";

import type { IconSvgElement } from "@hugeicons/react";
import * as React from "react";
import {
  ArrowUpRight01Icon,
  DiscordIcon,
  FigmaIcon,
  GithubIcon,
  SlackIcon,
} from "@hugeicons/core-free-icons";

import { Badge } from "@turbo/ui/components/badge";
import { Button } from "@turbo/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@turbo/ui/components/card";
import { Icon } from "@turbo/ui/components/icon";
import { Switch } from "@turbo/ui/components/switch";

interface Integration {
  name: string;
  description: string;
  icon: IconSvgElement;
  connected: boolean;
}

const integrations: Integration[] = [
  {
    name: "GitHub",
    description: "Sync issues and pull requests into your tasks.",
    icon: GithubIcon,
    connected: true,
  },
  {
    name: "Slack",
    description: "Get task updates and alerts in your channels.",
    icon: SlackIcon,
    connected: true,
  },
  {
    name: "Figma",
    description: "Attach design files directly to tasks.",
    icon: FigmaIcon,
    connected: false,
  },
  {
    name: "Discord",
    description: "Route community reports into your inbox.",
    icon: DiscordIcon,
    connected: false,
  },
];

/**
 * Integration tile: squircle `accent` icon tile beside the title, a status
 * badge in the body, and a dashed divider above the ghost footer action
 * (DESIGN.md → Components).
 */
const IntegrationCard = ({ integration }: { integration: Integration }) => {
  const [connected, setConnected] = React.useState(integration.connected);

  return (
    <Card size="sm" data-slot="integration-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-sm font-semibold">
          <span className="bg-accent flex size-10 shrink-0 items-center justify-center rounded-xl">
            <Icon
              icon={integration.icon}
              className="text-foreground size-5"
              strokeWidth={1.5}
            />
          </span>
          {integration.name}
        </CardTitle>
        <CardDescription>{integration.description}</CardDescription>
        <CardAction>
          <Switch
            checked={connected}
            onCheckedChange={setConnected}
            aria-label={`${connected ? "Disconnect" : "Connect"} ${integration.name}`}
            className="data-checked:bg-success"
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <Badge variant={connected ? "success" : "outline"}>
          {connected ? "Connected" : "Not connected"}
        </Badge>
      </CardContent>
      <CardFooter className="border-t border-dashed">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground -mx-2 justify-start"
        >
          Learn more
          <Icon icon={ArrowUpRight01Icon} data-icon="inline-end" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export const Integrations = () => (
  <section className="flex flex-col gap-4">
    <div className="flex items-center justify-between">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-semibold">Integrations</h2>
        <p className="text-muted-foreground text-sm">
          Connect the tools your team already uses
        </p>
      </div>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.name} integration={integration} />
      ))}
    </div>
  </section>
);
