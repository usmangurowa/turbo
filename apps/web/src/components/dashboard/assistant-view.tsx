"use client";

import * as React from "react";
import { useSession } from "@/hooks/use-session";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AiChat02Icon, SentIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@turbo/ui/components/alert";
import { Bubble, BubbleContent } from "@turbo/ui/components/bubble";
import { Button } from "@turbo/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@turbo/ui/components/empty";
import { Field } from "@turbo/ui/components/field";
import { Icon } from "@turbo/ui/components/icon";
import { Input } from "@turbo/ui/components/input";
import { Message, MessageContent } from "@turbo/ui/components/message";
import { Skeleton } from "@turbo/ui/components/skeleton";
import { Spinner } from "@turbo/ui/components/spinner";

const composerSchema = z.object({
  message: z.string().min(1).max(8000),
});

type ComposerFormData = z.infer<typeof composerSchema>;

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SignedOutState = () => (
  <Empty className="flex-1 rounded-2xl border border-dashed">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon icon={AiChat02Icon} />
      </EmptyMedia>
      <EmptyTitle>Sign in to use the assistant</EmptyTitle>
      <EmptyDescription>
        The assistant answers as your account, so conversations need a signed
        in session.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline" size="sm" asChild>
        <Link href="/login">Sign in</Link>
      </Button>
    </EmptyContent>
  </Empty>
);

const ConversationEmptyState = () => (
  <Empty className="flex-1">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Icon icon={AiChat02Icon} />
      </EmptyMedia>
      <EmptyTitle>Ask the assistant</EmptyTitle>
      <EmptyDescription>
        Replies stream from the first configured provider in @turbo/ai. Try
        &quot;What can you help me with?&quot;
      </EmptyDescription>
    </EmptyHeader>
  </Empty>
);

/**
 * Assistant chat view: message list + composer streaming replies from
 * POST /api/ai/chat through the typed Hono client.
 *
 * Degrades gracefully in the zero-env template: signed out it renders a
 * sign-in empty state, and when the endpoint answers 503 (no provider key
 * configured) it surfaces the setup hint with the env var names.
 */
export const AssistantView = () => {
  const { data: session, isPending: isSessionPending } = useSession();
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const [providerHint, setProviderHint] = React.useState<string | null>(null);
  const [unauthorized, setUnauthorized] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<ComposerFormData>({
    resolver: zodResolver(composerSchema),
  });

  const onSubmit = async (data: ComposerFormData) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: data.message,
    };
    const conversation = [...messages, userMessage];
    const assistantId = crypto.randomUUID();

    setMessages(conversation);
    reset();
    setIsStreaming(true);

    try {
      const res = await api.ai.chat.$post({
        json: {
          messages: conversation.map(({ role, content }) => ({
            role,
            content,
          })),
        },
      });

      if (res.status === 401) {
        setUnauthorized(true);
        return;
      }

      if (res.status === 503) {
        const body = (await res.json()) as { hint?: string };
        setProviderHint(
          body.hint ??
            "Set GOOGLE_GENERATIVE_AI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY",
        );
        return;
      }

      if (!res.ok || !res.body) {
        throw new Error("Failed to reach the assistant");
      }

      setProviderHint(null);
      setMessages((current) => [
        ...current,
        { id: assistantId, role: "assistant", content: "" },
      ]);

      const body: ReadableStream<Uint8Array> = res.body;
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let streamed = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        streamed += decoder.decode(value, { stream: true });
        const content = streamed;
        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId ? { ...message, content } : message,
          ),
        );
      }
    } catch {
      setMessages((current) =>
        current.filter((message) => message.id !== assistantId),
      );
      toast.error("The assistant is unavailable right now");
    } finally {
      setIsStreaming(false);
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex flex-1 flex-col gap-3 rounded-2xl border p-6">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (!session || unauthorized) {
    return <SignedOutState />;
  }

  return (
    <div
      data-slot="assistant-view"
      className="bg-card flex flex-1 flex-col overflow-hidden rounded-2xl border"
    >
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
        {messages.length === 0 ? (
          <ConversationEmptyState />
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              align={message.role === "user" ? "end" : "start"}
            >
              <MessageContent>
                <Bubble
                  variant={message.role === "user" ? "default" : "muted"}
                  align={message.role === "user" ? "end" : "start"}
                >
                  <BubbleContent>
                    {message.content === "" && isStreaming ? (
                      <Spinner className="size-4" />
                    ) : (
                      message.content
                    )}
                  </BubbleContent>
                </Bubble>
              </MessageContent>
            </Message>
          ))
        )}
      </div>
      {providerHint ? (
        <div className="px-6 pb-2">
          <Alert>
            <Icon icon={AiChat02Icon} />
            <AlertTitle>No AI provider configured</AlertTitle>
            <AlertDescription>{providerHint}</AlertDescription>
          </Alert>
        </div>
      ) : null}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex items-end gap-2 border-t p-4"
      >
        <Field className="flex-1">
          <Input
            placeholder="Ask about your workspace..."
            autoComplete="off"
            aria-label="Message the assistant"
            disabled={isStreaming}
            {...register("message")}
          />
        </Field>
        <Button
          type="submit"
          size="icon"
          aria-label="Send message"
          disabled={isStreaming || !isValid}
        >
          {isStreaming ? <Spinner /> : <Icon icon={SentIcon} />}
        </Button>
      </form>
    </div>
  );
};
