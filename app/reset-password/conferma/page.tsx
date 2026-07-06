import { Suspense } from "react";
import ResetConfirmForm from "./ResetConfirmForm";

export const dynamic = "force-dynamic";

export default function ResetPasswordConfirmPage() {
  return (
    <Suspense fallback={null}>
      <ResetConfirmForm />
    </Suspense>
  );
}
