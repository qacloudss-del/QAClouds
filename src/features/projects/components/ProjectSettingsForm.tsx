"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UpdateProjectSchema, type UpdateProjectInput } from "../schemas/project-schemas";
import { updateProject } from "../actions/project-actions";
import { cn } from "@/lib/utils";

const COLORS = ["#6366F1","#8B5CF6","#EC4899","#EF4444","#F97316","#EAB308","#22C55E","#06B6D4","#3B82F6","#64748B"];

interface Props { projectId: string; orgId: string; defaultValues: UpdateProjectInput }

export function ProjectSettingsForm({ projectId, orgId, defaultValues }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<UpdateProjectInput>({ resolver: zodResolver(UpdateProjectSchema), defaultValues });

  function onSubmit(values: UpdateProjectInput) {
    startTransition(async () => {
      const result = await updateProject(projectId, orgId, values);
      if (result.success) router.refresh();
      else form.setError("name", { message: result.error });
    });
  }

  const selectedColor = form.watch("color");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description <span className="text-muted-foreground">(optional)</span></FormLabel>
          <FormControl><Textarea rows={2} {...field} /></FormControl></FormItem>
        )} />
        <FormField control={form.control} name="color" render={({ field }) => (
          <FormItem><FormLabel>Color</FormLabel><FormControl>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => field.onChange(c)}
                  className={cn("h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    selectedColor === c && "ring-2 ring-offset-2 ring-foreground")}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </FormControl></FormItem>
        )} />
        <Button type="submit" disabled={isPending}>{isPending ? "Saving..." : "Save changes"}</Button>
      </form>
    </Form>
  );
}
