import { Suspense } from "react";
import ResetRequestForm from "./ResetRequestForm";

export const dynamic = "force-dynamic";

export default function ResetPasswordRequestPage() {
  return (
    <Suspense fallback={null}>
      <ResetRequestForm />
    </Suspense>
  );
}
