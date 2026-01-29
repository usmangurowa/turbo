"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loading03Icon,
  MessageMultiple02Icon,
} from "@hugeicons/core-free-icons";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@turbo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@turbo/ui/dialog";
import { Field, FieldError, FieldLabel } from "@turbo/ui/field";
import { Icon } from "@turbo/ui/icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@turbo/ui/select";
import { Textarea } from "@turbo/ui/textarea";

import { useApi } from "../hooks/use-api";

const formSchema = z.object({
  type: z.enum(["bug", "feature", "feedback", "other"]),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

interface FeedbackDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultType?: "bug" | "feature" | "feedback" | "other";
}

export function FeedbackDialog({
  children,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  defaultType = "feedback",
}: FeedbackDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const client = useApi();

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? setControlledOpen : setInternalOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: defaultType,
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const response = await client.support.$post({ json: values });

      if (!response.ok) {
        throw new Error("Failed to send feedback");
      }

      toast.success("Feedback sent", {
        description: "Thank you for your feedback! We'll look into it shortly.",
      });
      setOpen?.(false);
      form.reset();
    } catch {
      toast.error("Error sending feedback", {
        description: "Please try again later.",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="sm">
            <Icon icon={MessageMultiple02Icon} className="mr-2 h-4 w-4" />
            Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve Turbo. Report a bug, suggest a feature, or just say
            hi.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            control={form.control}
            name="type"
            render={({ field }) => (
              <Field data-invalid={!!form.formState.errors.type}>
                <FieldLabel>Type</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Report Bug</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="feedback">Feedback</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError>{form.formState.errors.type?.message}</FieldError>
              </Field>
            )}
          />

          <Field data-invalid={!!form.formState.errors.message}>
            <FieldLabel htmlFor="message">Message</FieldLabel>
            <Textarea
              id="message"
              placeholder="Tell us what's on your mind..."
              className="min-h-[100px]"
              aria-invalid={!!form.formState.errors.message}
              {...form.register("message")}
            />
            <FieldError>{form.formState.errors.message?.message}</FieldError>
          </Field>

          <DialogFooter>
            <Button
              type="submit"
              size="sm"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting && (
                <Icon icon={Loading03Icon} className="mr-2 animate-spin" />
              )}
              Send Feedback
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
