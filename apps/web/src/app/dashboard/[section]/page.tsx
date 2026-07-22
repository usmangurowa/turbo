import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sectionNavItems } from "@/components/dashboard/nav-config";

import { Button } from "@turbo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@turbo/ui/components/empty";
import { Icon } from "@turbo/ui/components/icon";

interface SectionPageProps {
  params: Promise<{ section: string }>;
}

const getSection = (slug: string) =>
  sectionNavItems.find((item) => item.slug === slug);

export function generateStaticParams() {
  return sectionNavItems.map((item) => ({ section: item.slug }));
}

export async function generateMetadata({
  params,
}: SectionPageProps): Promise<Metadata> {
  const { section } = await params;
  const item = getSection(section);

  if (!item) {
    return {};
  }

  return { title: item.label, description: item.description };
}

export default async function DashboardSectionPage({
  params,
}: SectionPageProps) {
  const { section } = await params;
  const item = getSection(section);

  if (!item) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold tracking-tight">{item.label}</h2>
        <p className="text-muted-foreground text-sm">{item.description}</p>
      </div>

      <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={item.icon} />
            </EmptyMedia>
            <EmptyTitle>Build {item.label.toLowerCase()} here</EmptyTitle>
            <EmptyDescription>
              This route ships with the template as a starting point. Replace it
              with your own {item.label.toLowerCase()} experience.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" asChild>
              <a
                href="https://github.com/usmangurowa/turbo"
                target="_blank"
                rel="noreferrer"
              >
                View template docs
              </a>
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    </div>
  );
}
