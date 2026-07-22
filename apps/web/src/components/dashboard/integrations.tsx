import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowUpRight01Icon,
  DiscordIcon,
  FigmaIcon,
  GithubIcon,
  SlackIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@turbo/ui/components/button";
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

const IntegrationCard = ({ integration }: { integration: Integration }) => (
  <div
    data-slot="integration-card"
    className="bg-card flex flex-col gap-4 rounded-2xl border p-6"
  >
    <div className="flex items-start justify-between">
      <div className="border-border/60 flex size-11 items-center justify-center rounded-xl border bg-white shadow-xs">
        <Icon
          icon={integration.icon}
          className="size-5 text-neutral-900"
          strokeWidth={1.5}
        />
      </div>
      <Switch
        defaultChecked={integration.connected}
        className="data-checked:bg-success"
      />
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold">{integration.name}</h3>
      <p className="text-muted-foreground text-sm">{integration.description}</p>
    </div>
    <div className="border-t border-dashed" />
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground -mx-2 justify-start"
    >
      Learn more
      <Icon icon={ArrowUpRight01Icon} className="size-3.5" />
    </Button>
  </div>
);

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
