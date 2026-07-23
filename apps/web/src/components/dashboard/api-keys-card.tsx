"use client";

import type { ApiKeySummary } from "@/hooks/use-api-keys";
import * as React from "react";
import {
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
} from "@/hooks/use-api-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Copy01Icon,
  Delete02Icon,
  Key01Icon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@turbo/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@turbo/ui/components/alert-dialog";
import { Badge } from "@turbo/ui/components/badge";
import { Button } from "@turbo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@turbo/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@turbo/ui/components/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@turbo/ui/components/field";
import { Icon } from "@turbo/ui/components/icon";
import { Input } from "@turbo/ui/components/input";
import { Skeleton } from "@turbo/ui/components/skeleton";
import { Spinner } from "@turbo/ui/components/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@turbo/ui/components/table";
import { cn } from "@turbo/ui/lib/utils";

const createKeySchema = z.object({
  name: z
    .string()
    .min(1, "Give the key a name")
    .max(64, "Keep the name under 64 characters"),
});

type CreateKeyFormData = z.infer<typeof createKeySchema>;

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/**
 * Create-key dialog. On success the one-time plaintext key is shown with a
 * copy action — Better Auth stores only a hash, so it can never be shown
 * again. Closing the dialog discards the plaintext for good.
 */
const CreateKeyDialog = () => {
  const [open, setOpen] = React.useState(false);
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);
  const createApiKey = useCreateApiKey();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateKeyFormData>({
    resolver: zodResolver(createKeySchema),
  });

  const onOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setCreatedKey(null);
      reset();
    }
  };

  const onSubmit = async (data: CreateKeyFormData) => {
    try {
      const apiKey = await createApiKey.mutateAsync({ name: data.name });
      setCreatedKey(apiKey.key);
    } catch {
      toast.error("Failed to create API key");
    }
  };

  const copyKey = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    toast.success("API key copied to clipboard");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Icon icon={PlusSignIcon} data-icon="inline-start" />
          Create key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        {createdKey ? (
          <>
            <DialogHeader>
              <DialogTitle>Save your API key</DialogTitle>
              <DialogDescription>
                This is the only time the full key is shown. Store it somewhere
                safe.
              </DialogDescription>
            </DialogHeader>
            <Alert>
              <Icon icon={Key01Icon} />
              <AlertTitle>You won&apos;t see this again</AlertTitle>
              <AlertDescription>
                <code className="text-foreground block font-mono text-xs break-all">
                  {createdKey}
                </code>
              </AlertDescription>
            </Alert>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={copyKey}>
                <Icon icon={Copy01Icon} data-icon="inline-start" />
                Copy key
              </Button>
              <Button type="button" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
                <DialogDescription>
                  Name the key after where you&apos;ll use it, like &quot;CI
                  deploys&quot; or &quot;Local scripts&quot;.
                </DialogDescription>
              </DialogHeader>
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="api-key-name">Name</FieldLabel>
                <Input
                  id="api-key-name"
                  placeholder="CI deploys"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError>{errors.name?.message}</FieldError>
              </Field>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Spinner data-icon="inline-start" />}
                  {isSubmitting ? "Creating..." : "Create key"}
                </Button>
              </DialogFooter>
            </FieldGroup>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const RevokeKeyDialog = ({ apiKey }: { apiKey: ApiKeySummary }) => {
  const revokeApiKey = useRevokeApiKey();

  const onRevoke = async () => {
    try {
      await revokeApiKey.mutateAsync(apiKey.id);
      toast.success("API key revoked");
    } catch {
      toast.error("Failed to revoke API key");
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Revoke ${apiKey.name ?? "API key"}`}
        >
          <Icon icon={Delete02Icon} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Revoke this API key?</AlertDialogTitle>
          <AlertDialogDescription>
            Anything using {apiKey.name ? `"${apiKey.name}"` : "this key"} will
            lose access immediately. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onRevoke}>
            Revoke key
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

const KeyRows = ({ apiKeys }: { apiKeys: ApiKeySummary[] }) => (
  <>
    {apiKeys.map((apiKey) => (
      <TableRow key={apiKey.id}>
        <TableCell>
          <span className="text-foreground font-medium">
            {apiKey.name ?? "Untitled key"}
          </span>
        </TableCell>
        <TableCell>
          <code className="text-muted-foreground font-mono text-xs">
            {apiKey.start
              ? `${apiKey.start}\u2026`
              : "\u2022\u2022\u2022\u2022\u2022\u2022"}
          </code>
        </TableCell>
        <TableCell>
          <span className="text-muted-foreground text-sm">
            {formatDate(apiKey.createdAt)}
          </span>
        </TableCell>
        <TableCell>
          <span className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "size-2 rounded-full",
                apiKey.enabled ? "bg-success" : "bg-muted-foreground",
              )}
            />
            {apiKey.enabled ? "Active" : "Disabled"}
          </span>
        </TableCell>
        <TableCell className="text-right">
          <RevokeKeyDialog apiKey={apiKey} />
        </TableCell>
      </TableRow>
    ))}
  </>
);

const LoadingRows = () => (
  <>
    {[0, 1, 2].map((row) => (
      <TableRow key={row} className="hover:bg-transparent">
        {[0, 1, 2, 3, 4].map((cell) => (
          <TableCell key={cell}>
            <Skeleton className="h-4 w-full max-w-24" />
          </TableCell>
        ))}
      </TableRow>
    ))}
  </>
);

/**
 * API keys management card for the settings page: list, create (with the
 * one-time plaintext reveal), and revoke. Renders a sign-in prompt when the
 * request is unauthenticated, so the zero-env template never crashes here.
 */
export const ApiKeysCard = () => {
  const { data: apiKeys, isPending, isError } = useApiKeys();

  const signedOut = !isPending && !isError && apiKeys === null;
  const showTable = isPending || (Array.isArray(apiKeys) && apiKeys.length > 0);

  return (
    <div data-slot="api-keys-card" className="bg-card rounded-2xl border">
      <div className="flex items-center justify-between gap-4 px-6 py-4">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-base font-semibold">API keys</h2>
          <p className="text-muted-foreground text-sm">
            Programmatic access to your workspace, rate limited per key.
          </p>
        </div>
        {!signedOut && !isError ? <CreateKeyDialog /> : null}
      </div>
      {signedOut ? (
        <Empty className="border-t border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={Key01Icon} />
            </EmptyMedia>
            <EmptyTitle>Sign in to manage API keys</EmptyTitle>
            <EmptyDescription>
              API keys belong to your account. Sign in to create and revoke
              them.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : isError ? (
        <Empty className="border-t border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={Key01Icon} />
            </EmptyMedia>
            <EmptyTitle>Couldn&apos;t load API keys</EmptyTitle>
            <EmptyDescription>
              Something went wrong fetching your keys. Refresh to try again.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : showTable ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isPending ? <LoadingRows /> : <KeyRows apiKeys={apiKeys ?? []} />}
          </TableBody>
        </Table>
      ) : (
        <Empty className="border-t border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Icon icon={Key01Icon} />
            </EmptyMedia>
            <EmptyTitle>No API keys yet</EmptyTitle>
            <EmptyDescription>
              Create a key to call the API from scripts, CI, or anywhere outside
              the browser.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <div className="text-muted-foreground border-t px-6 py-3 text-xs">
        Keys are shown in full exactly once, at creation. Revoking a key cuts
        off access immediately.
        {Array.isArray(apiKeys) && apiKeys.length > 0 ? (
          <Badge
            variant="secondary"
            className="ml-2 rounded-full text-[10px] font-normal"
          >
            {apiKeys.length} {apiKeys.length === 1 ? "key" : "keys"}
          </Badge>
        ) : null}
      </div>
    </div>
  );
};
