"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { TurboLogo } from "@/components/turbo-logo";
import { useApiKeys } from "@/hooks/use-api-keys";
import { useIsMac } from "@/hooks/use-is-mac";
import { redirect } from "next/navigation";

const ConnectPage = () => {
  redirect("/dashboard");
};

export default ConnectPage;
/*

/**
 * IDE Support Grid
 */
const IDESupportGrid = () => (
  <div className="flex flex-wrap gap-3">
    {SUPPORTED_IDES.map((ide) => (
      <div
        key={ide.id}
        className="bg-muted/50 hover:bg-muted flex items-center gap-2 rounded-full px-3 py-2 transition-colors"
      >
        <div className="relative size-4">
          <Image
            src={ide.logo}
            alt={ide.name}
            fill
            className={`object-contain ${ide.invert ? "dark:invert" : ""}`}
          />
        </div>
        <span className="text-sm font-medium">{ide.name}</span>
      </div>
    ))}
  </div>
);

/**
 * API Key Generator
 */
const ApiKeyGenerator = ({
  onKeyGenerated,
  onCopied,
  hasCopied,
  invalidate,
}: {
  onKeyGenerated: (key: string) => void;
  onCopied: () => void;
  hasCopied: boolean;
  invalidate: () => void;
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await authClient.apiKey.create({
        name: `Extension - ${format(new Date(), "yyyy-MM-dd")}`,
      });

      if (error) {
        toast.error("Failed to generate API key");
        return;
      }

      setGeneratedKey(data.key);
      onKeyGenerated(data.key);
      invalidate();
      toast.success("API key generated!");
    } catch {
      toast.error("Failed to generate API key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedKey) return;

    try {
      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      onCopied();
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const isCopied = Boolean(copied || hasCopied);

  if (generatedKey) {
    return (
      <div className="space-y-3">
        <div className="bg-muted flex items-center gap-2 rounded-lg p-3">
          <code className="flex-1 font-mono text-sm break-all">
            {generatedKey}
          </code>
          <Button
            variant={isCopied ? "ghost" : "default"}
            size="sm"
            onClick={handleCopy}
          >
            <Icon
              icon={isCopied ? Tick01Icon : Copy01Icon}
              className="mr-1 h-4 w-4"
            />
            {isCopied ? "Copied" : "Copy"}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">
          ⚠️ Save this key somewhere safe - you won&apos;t see it again!
        </p>
      </div>
    );
  }

  return (
    <Button onClick={handleGenerate} disabled={isGenerating}>
      {isGenerating ? (
        <>
          <Icon icon={Loading01Icon} className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Icon icon={Key01Icon} className="mr-2 h-4 w-4" />
          Generate API Key
        </>
      )}
    </Button>
  );
};

/**
 * Connection instructions
 */
const ConnectionInstructions = ({ isMac }: { isMac: boolean }) => (
  <ol className="space-y-4 text-sm">
    <li className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium">
        1
      </span>
      <div>
        <span>Open Command Palette in your IDE</span>
        <div className="mt-1.5 flex items-center gap-1">
          {isMac ? (
            <>
              <Kbd>⌘</Kbd>
              <span className="text-muted-foreground text-xs">+</span>
              <Kbd>Shift</Kbd>
              <span className="text-muted-foreground text-xs">+</span>
              <Kbd>P</Kbd>
            </>
          ) : (
            <>
              <Kbd>Ctrl</Kbd>
              <span className="text-muted-foreground text-xs">+</span>
              <Kbd>Shift</Kbd>
              <span className="text-muted-foreground text-xs">+</span>
              <Kbd>P</Kbd>
            </>
          )}
        </div>
      </div>
    </li>
    <li className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium">
        2
      </span>
      <div>
        <span>Run the command</span>
        <div className="mt-1.5">
          <code className="bg-muted rounded px-2 py-1 text-xs font-medium">
            Turbo: Set API Key
          </code>
        </div>
      </div>
    </li>
    <li className="flex items-start gap-3">
      <span className="bg-muted text-muted-foreground flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs font-medium">
        3
      </span>
      <span>Paste your API key when prompted</span>
    </li>
  </ol>
);

/**
 * Connected status
 */
const ConnectedStatus = ({
  connectedEditors,
}: {
  connectedEditors: string[];
}) => {
  const connectedIdes = SUPPORTED_IDES.filter((ide) =>
    connectedEditors.includes(ide.id),
  );

  return (
    <div className="flex items-center gap-3 text-green-600 dark:text-green-500">
      <Icon icon={CheckmarkCircle02Icon} className="h-5 w-5" />
      <span className="font-medium">Connected</span>
      {connectedIdes.length > 0 && (
        <div className="flex gap-1.5">
          {connectedIdes.map((ide) => (
            <div key={ide.id} className="relative h-5 w-5">
              <Image
                src={ide.logo}
                alt={ide.name}
                fill
                className={`object-contain ${ide.invert ? "dark:invert" : ""}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Connect Page - Onboarding flow to connect IDE extension
 */
export default function ConnectPage() {
  const router = useRouter();
  const isMac = useIsMac();

  // Step completion states
  const [installVerified, setInstallVerified] = useState(false);
  const [apiKeyGenerated, setApiKeyGenerated] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Poll for connected editors after API key is copied
  const shouldPoll = apiKeyGenerated && apiKeyCopied;
  const { keys, isLoading, invalidate } = useApiKeys({
    refetchInterval: shouldPoll ? 5000 : false,
  });

  const connectedEditors = keys.flatMap((key) => key.connectedEditors);
  const hasConnectedEditor = connectedEditors.length > 0;

  const handleVerifyInstall = async () => {
    setIsVerifying(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setInstallVerified(true);
    setIsVerifying(false);
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  if (isLoading) {
    return (
      <main className="container flex min-h-0 flex-1 flex-col py-8">
        <Skeleton className="mb-10 h-16 w-64" />
        <div className="max-w-xl space-y-10">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="container flex min-h-0 flex-1 flex-col overflow-auto py-8">
      {/* Header */}
      <div className="mb-10 flex items-center gap-4">
        <TurboLogo size="lg" className="opacity-80" />
        <div>
          <h1 className="text-2xl font-bold">Welcome to Turbo</h1>
          <p className="text-muted-foreground">
            Let&apos;s get your extension connected.
          </p>
        </div>
      </div>

      {/* Continuous form sections */}
      <div className="max-w-xl space-y-10">
        {/* Step 1: Install Extension */}
        <OnboardingSection
          stepNumber={1}
          title="Install the Extension"
          description="Search for 'Turbo Template' in your IDE's extension marketplace."
          isActive={!installVerified}
          isCompleted={installVerified}
        >
          <div className="space-y-4">
            <IDESupportGrid />
            {!installVerified && (
              <Button
                onClick={handleVerifyInstall}
                disabled={isVerifying}
                variant="outline"
              >
                {isVerifying ? (
                  <>
                    <Icon
                      icon={Loading01Icon}
                      className="mr-2 h-4 w-4 animate-spin"
                    />
                    Checking...
                  </>
                ) : (
                  "I've installed the extension"
                )}
              </Button>
            )}
          </div>
        </OnboardingSection>

        {/* Divider */}
        <div className="border-border ml-4 h-4 border-l-2" />

        {/* Step 2: Generate API Key */}
        <OnboardingSection
          stepNumber={2}
          title="Generate API Key"
          description="Create an API key to connect your extension."
          isActive={installVerified && !apiKeyCopied}
          isCompleted={apiKeyCopied}
        >
          <ApiKeyGenerator
            onKeyGenerated={() => setApiKeyGenerated(true)}
            onCopied={() => setApiKeyCopied(true)}
            hasCopied={apiKeyCopied}
            invalidate={invalidate}
          />
        </OnboardingSection>

        {/* Divider */}
        <div className="border-border ml-4 h-4 border-l-2" />

        {/* Step 3: Connect Extension */}
        <OnboardingSection
          stepNumber={3}
          title="Connect Extension"
          description="Paste your API key in your IDE."
          isActive={apiKeyCopied && !hasConnectedEditor}
          isCompleted={hasConnectedEditor}
        >
          {hasConnectedEditor ? (
            <ConnectedStatus connectedEditors={connectedEditors} />
          ) : (
            <div className="space-y-4">
              <ConnectionInstructions isMac={isMac} />
              {shouldPoll && (
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Icon icon={Loading01Icon} className="h-4 w-4 animate-spin" />
                  Waiting for connection...
                </div>
              )}
            </div>
          )}
        </OnboardingSection>

        {/* Final CTA */}
        {hasConnectedEditor && (
          <div className="ml-12 pt-4">
            <Button onClick={handleGoToDashboard}>
              Go to Dashboard
              <Icon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Help link */}
      <div className="text-muted-foreground mt-auto pt-8 text-sm">
        Having trouble?{" "}
        <a
          href="https://turbo.app/docs/getting-started"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Check our setup guide
        </a>
      </div>
    </main>
  );
}
*/
