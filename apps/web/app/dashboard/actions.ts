"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z, ZodError } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { parseGoalFormData } from "@/lib/validation/goal";
import { parseRunFormData } from "@/lib/validation/run";
import { parseShoeFormData } from "@/lib/validation/shoe";

const idSchema = z.string().uuid();

export async function createRun(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);

  try {
    const values = parseRunFormData(formData);
    const { error } = await supabase.from("runs").insert({
      user_id: user.id,
      ...values,
    });

    if (error) {
      redirect("/dashboard?run_error=create_failed");
    }
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/dashboard?run_error=invalid_run");
    }

    throw error;
  }

  revalidateCorePaths();
  redirect("/dashboard?run_notice=created");
}

export async function updateRun(runId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  await requireUser(supabase);
  const id = idSchema.parse(runId);

  try {
    const values = parseRunFormData(formData);
    const { error } = await supabase.from("runs").update(values).eq("id", id);

    if (error) {
      redirect(`/runs/${id}/edit?run_error=update_failed`);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      redirect(`/runs/${id}/edit?run_error=invalid_run`);
    }

    throw error;
  }

  revalidateCorePaths();
  redirect(`/runs/${id}?run_notice=updated`);
}

export async function deleteRun(runId: string) {
  const supabase = await createServerSupabaseClient();
  await requireUser(supabase);
  const id = idSchema.parse(runId);
  const { error } = await supabase.from("runs").delete().eq("id", id);

  if (error) {
    redirect(`/runs/${id}?run_error=delete_failed`);
  }

  revalidateCorePaths();
  redirect("/runs?run_notice=deleted");
}

export async function createShoe(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);

  try {
    const values = parseShoeFormData(formData);
    const { error } = await supabase.from("shoes").insert({
      user_id: user.id,
      name: values.name,
      retired_at: values.retired ? new Date().toISOString().slice(0, 10) : null,
    });

    if (error) {
      redirect("/shoes?shoe_error=create_failed");
    }
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/shoes?shoe_error=invalid_shoe");
    }

    throw error;
  }

  revalidateCorePaths();
  redirect("/shoes?shoe_notice=created");
}

export async function updateShoe(shoeId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  await requireUser(supabase);
  const id = idSchema.parse(shoeId);

  try {
    const values = parseShoeFormData(formData);
    const { error } = await supabase
      .from("shoes")
      .update({
        name: values.name,
        retired_at: values.retired
          ? new Date().toISOString().slice(0, 10)
          : null,
      })
      .eq("id", id);

    if (error) {
      redirect("/shoes?shoe_error=update_failed");
    }
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/shoes?shoe_error=invalid_shoe");
    }

    throw error;
  }

  revalidateCorePaths();
  redirect("/shoes?shoe_notice=updated");
}

export async function deleteShoe(shoeId: string) {
  const supabase = await createServerSupabaseClient();
  await requireUser(supabase);
  const id = idSchema.parse(shoeId);
  const { error } = await supabase.from("shoes").delete().eq("id", id);

  if (error) {
    redirect("/shoes?shoe_error=delete_failed");
  }

  revalidateCorePaths();
  redirect("/shoes?shoe_notice=deleted");
}

export async function createGoal(formData: FormData) {
  const supabase = await createServerSupabaseClient();
  const user = await requireUser(supabase);

  try {
    const values = parseGoalFormData(formData);
    const { error } = await supabase.from("goals").insert({
      user_id: user.id,
      type: values.type,
      target_value: values.targetValue,
      target_date: values.targetDate,
      status: values.status,
    });

    if (error) {
      redirect("/goals?goal_error=create_failed");
    }
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/goals?goal_error=invalid_goal");
    }

    throw error;
  }

  revalidateCorePaths();
  redirect("/goals?goal_notice=created");
}

export async function updateGoal(goalId: string, formData: FormData) {
  const supabase = await createServerSupabaseClient();
  await requireUser(supabase);
  const id = idSchema.parse(goalId);

  try {
    const values = parseGoalFormData(formData);
    const { error } = await supabase
      .from("goals")
      .update({
        type: values.type,
        target_value: values.targetValue,
        target_date: values.targetDate,
        status: values.status,
      })
      .eq("id", id);

    if (error) {
      redirect("/goals?goal_error=update_failed");
    }
  } catch (error) {
    if (error instanceof ZodError) {
      redirect("/goals?goal_error=invalid_goal");
    }

    throw error;
  }

  revalidateCorePaths();
  redirect("/goals?goal_notice=updated");
}

export async function deleteGoal(goalId: string) {
  const supabase = await createServerSupabaseClient();
  await requireUser(supabase);
  const id = idSchema.parse(goalId);
  const { error } = await supabase.from("goals").delete().eq("id", id);

  if (error) {
    redirect("/goals?goal_error=delete_failed");
  }

  revalidateCorePaths();
  redirect("/goals?goal_notice=deleted");
}

async function requireUser(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/?auth_error=session_required");
  }

  return user;
}

function revalidateCorePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/runs");
  revalidatePath("/shoes");
  revalidatePath("/goals");
}
