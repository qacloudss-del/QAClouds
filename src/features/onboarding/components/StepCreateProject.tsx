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
import { CreateProjectSchema, type CreateProjectInput } from "../schemas/onboarding-schemas";
import { createProject } from "../actions/onboarding-actions";
import { FolderOpen } from "lucide-react";

const PROJECT_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899", "#EF4444",
  "#F97316", "#EAB308", "#22C55E", "#06B6D4",
];

interface Props {
  orgId: string;
  onComplete: (projectId: string, projectName: string) => void;
}

export function StepCreateProject({ orgId, onComplete }: Props) {
  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(CreateProjectSchema),
    defaultValues: { name: "", color: "#6366F1" },
  });

  async function onSubmit(values: CreateProjectInput) {
    const result = await createProject(orgId, values);
    if (result.success) {
      onComplete(result.data.id, result.data.name);
    } else {
      form.setError("name", { message: result.error });
    }
  }

  const selectedColor = form.watch("color");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg border bg-muted p-2">
          <FolderOpen className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">Create your first project</h2>
          <p className="text-sm text-muted-foreground">
            Projects organize your test cases and executions.
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
                <FormLabel>Project name</FormLabel>
                <FormControl>
                  <Input placeholder="Web App" autoFocus {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    {PROJECT_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => field.onChange(color)}
                        className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        style={{
                          backgroundColor: color,
                          outline: selectedColor === color ? `2px solid ${color}` : "none",
                          outlineOffset: "2px",
                        }}
                      />
                    ))}
                  </div>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Creating..." : "Create project →"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
