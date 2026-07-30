import type { SupabaseClient } from "@supabase/supabase-js";
import { formatShortDate } from "@/lib/time";

export type MentorApplicationEligibility = {
  visible: boolean;
  pending: boolean;
};

export type SubmitMentorApplicationParams = {
  p_full_name: string;
  p_email: string;
  p_phone: string | null;
  p_birth_year: number;
  p_city: string;
  p_experience_areas: string[];
  p_custom_area_tags: string[];
  p_listening_background: string;
  p_weekly_availability: string;
  p_q_why: string;
  p_q_listened: string;
  p_q_crisis: string;
};

export type SubmitMentorApplicationResult =
  | { ok: true }
  | { ok: false; reason: "already_open" }
  | { ok: false; reason: "cooldown"; retry_after?: string }
  | { ok: false; reason: "missing_fields"; fields?: string[] };

function parseSubmitResult(raw: unknown): SubmitMentorApplicationResult | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.ok === true) return { ok: true };
  if (r.ok !== false || typeof r.reason !== "string") return null;
  if (r.reason === "already_open") return { ok: false, reason: "already_open" };
  if (r.reason === "cooldown") {
    return {
      ok: false,
      reason: "cooldown",
      retry_after:
        typeof r.retry_after === "string"
          ? r.retry_after
          : typeof r.retry_at === "string"
            ? r.retry_at
            : undefined,
    };
  }
  if (r.reason === "missing_fields") {
    const fields = Array.isArray(r.fields)
      ? r.fields.filter((f): f is string => typeof f === "string")
      : undefined;
    return { ok: false, reason: "missing_fields", fields };
  }
  return null;
}

export async function fetchMentorApplicationEligibility(
  supabase: SupabaseClient,
): Promise<MentorApplicationEligibility | null> {
  const { data, error } = await supabase.rpc("mentor_application_eligibility");
  if (error || !data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  return {
    visible: row.visible === true,
    pending: row.pending === true,
  };
}

export async function submitMentorApplication(
  supabase: SupabaseClient,
  params: SubmitMentorApplicationParams,
): Promise<
  | { status: "success" }
  | { status: "already_open" }
  | { status: "cooldown"; retryLabel: string }
  | { status: "missing_fields"; fields?: string[] }
  | { status: "network" }
> {
  const { data, error } = await supabase.rpc("submit_mentor_application", params);

  if (error) {
    console.error("submit_mentor_application:", error);
    return { status: "network" };
  }

  const parsed = parseSubmitResult(data);
  if (!parsed) return { status: "network" };

  if (parsed.ok) return { status: "success" };
  if (parsed.reason === "already_open") return { status: "already_open" };
  if (parsed.reason === "cooldown") {
    const retryLabel = parsed.retry_after
      ? formatShortDate(parsed.retry_after)
      : "data indicata";
    return { status: "cooldown", retryLabel };
  }
  if (parsed.reason === "missing_fields") {
    return { status: "missing_fields", fields: parsed.fields };
  }

  return { status: "network" };
}
