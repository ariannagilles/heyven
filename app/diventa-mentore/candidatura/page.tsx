import type { Metadata } from "next";
import { Suspense } from "react";
import MentorApplicationForm from "./MentorApplicationForm";

export const metadata: Metadata = {
  title: "Candidatura Mentore — Heyven",
};

export default function CandidaturaPage() {
  return (
    <Suspense fallback={null}>
      <MentorApplicationForm />
    </Suspense>
  );
}
