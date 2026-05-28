"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createEnvironment,
  setDefaultEnvironment,
  deleteEnvironment,
} from "../actions/env-actions";
import { CreateEnvironmentSchema, type CreateEnvironmentInput } from "../schemas/env-schemas";
import { Plus, Star, Trash2 } from "lucide-react";
import type { Environment } from "@prisma/client";

interface Props {
  environments: Environment[];
  projectId: string;
  orgId: string;
}

export function EnvironmentsList({ environments, projectId, orgId }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateEnvironmentInput>({
    resolver: zodResolver(CreateEnvironmentSchema),
    defaultValues: { name: "", description: "", isDefault: false },
  });

  function onSubmit(values: CreateEnvironmentInput) {
    startTransition(async () => {
      const result = await createEnvironment(projectId, orgId, values);
      if (result.success) {
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        form.setError("name", { message: result.error });
      }
    });
  }

  function handleSetDefault(envId: string) {
    startTransition(async () => {
      await setDefaultEnvironment(envId, projectId, orgId);
      router.refresh();
    });
  }

  function handleDelete(envId: string) {
    startTransition(async () => {
      const result = await deleteEnvironment(envId, projectId, orgId);
      if (!result.success) alert(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {environments.length} environment{environments.length !== 1 ? "s" : ""}
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add environment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Add environment</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Staging" autoFocus {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={isPending}>Add</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {environments.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No environments yet. Add one to associate test runs with deployment targets.
        </div>
      ) : (
        <div className="rounded-lg border divide-y">
          {environments.map((env) => (
            <div key={env.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{env.name}</span>
                {env.isDefault && (
                  <Badge variant="secondary" className="text-[10px]">Default</Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                {!env.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-muted-foreground"
                    onClick={() => handleSetDefault(env.id)}
                    disabled={isPending}
                  >
                    <Star className="h-3.5 w-3.5 mr-1" />
                    Set default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDelete(env.id)}
                  disabled={isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
