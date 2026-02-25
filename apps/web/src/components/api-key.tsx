"use client";

import { useState } from "react";
import { authClient } from "@/auth/client";
import {
  Copy01Icon,
  Key01Icon,
  Loading01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons";
import { format } from "date-fns";

import { Button } from "@turbo/ui/button";
import { Icon } from "@turbo/ui/icon";
import { toast } from "@turbo/ui/toast";

interface ApiKeyCardProps {
  apiKey: {
    id: string;
    name: string | null;
    start: string | null;
    createdAt: Date;
  };
  onDelete?: (id: string) => void;
}

export const ApiKeyCard = ({ apiKey, onDelete }: ApiKeyCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await authClient.apiKey.delete({ keyId: apiKey.id });
      toast.success("API key deleted");
      onDelete?.(apiKey.id);
    } catch {
      toast.error("Failed to delete API key");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div className="bg-muted rounded-md p-2">
          <Icon icon={Key01Icon} className="text-muted-foreground h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{apiKey.name ?? "Unnamed Key"}</p>
          <p className="text-muted-foreground font-mono text-sm">
            {apiKey.start}••••••••
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </Button>
    </div>
  );
};

interface GenerateApiKeyProps {
  onKeyGenerated?: () => void;
}

export const GenerateApiKey = ({ onKeyGenerated }: GenerateApiKeyProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNewKey(null);
    setCopied(false);

    try {
      const { data, error } = await authClient.apiKey.create({
        name: `API Key - ${format(new Date(), "yyyy-MM-dd")}`,
      });

      if (error) {
        toast.error("Failed to generate API key");
        return;
      }

      setNewKey(data.key);
      toast.success("API key generated! Copy it now - you won't see it again.");
      onKeyGenerated?.();
    } catch {
      toast.error("Failed to generate API key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!newKey) return;

    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      toast.success("API key copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <div className="bg-card border-border rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Generate API Key</h3>
          <p className="text-muted-foreground text-sm">
            Generate a key for programmatic API access
          </p>
        </div>
        <Button onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Icon
                icon={Loading01Icon}
                className="mr-2 h-4 w-4 animate-spin"
              />
              Generating...
            </>
          ) : (
            <>
              <Icon icon={Key01Icon} className="mr-2 h-4 w-4" />
              Generate Key
            </>
          )}
        </Button>
      </div>

      {newKey && (
        <div className="mt-4">
          <div className="bg-muted flex items-center gap-2 rounded-md p-3">
            <code className="flex-1 font-mono text-sm break-all">{newKey}</code>
            <Button variant="ghost" size="icon" onClick={handleCopy}>
              <Icon
                icon={copied ? Tick01Icon : Copy01Icon}
                className="h-4 w-4"
              />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            ⚠️ Save this key now! You won&apos;t be able to see it again.
          </p>
        </div>
      )}
    </div>
  );
};
