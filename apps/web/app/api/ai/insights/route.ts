import { NextResponse } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createAiToolContext, getSavedInsights } from "@/lib/ai/tools";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );

  try {
    return NextResponse.json({
      insights: await getSavedInsights(createAiToolContext(supabase)),
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load saved insights." },
      { status: 502 },
    );
  }
}
