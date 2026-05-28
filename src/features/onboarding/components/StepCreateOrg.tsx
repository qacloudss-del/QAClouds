"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreateOrgSchema, type CreateOrgInput } from "../schemas/onboarding-schemas";
import { createOrganization } from "../actions/onboarding-actions";
import { Building2 } from "lucide-react";

interface Props {
  onComplete: (orgId: string, orgName: string) => void;
}

export function StepCreateOrg({ onComplete }: Props) {
  const form = useForm<CreateOrgInput>({
    resolver: zodResolver(CreateOrgSchema),
    defaultValues: { name: "" },
  });

  async function onSubmit(values: CreateOrgInput) {
    const result = await createOrganization(values);
    if (result.success) {
      onComplete(result.data.id, result.data.name);
    } else {
      form.setError("name", { message: result.error });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border bg-muted p-2">
          <Building2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Create your organization</h2>
          <p className="text-sm text-muted-foreground">
            This is your team&apos;s workspace in QAClouds.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Acme Corp"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create organization →"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
