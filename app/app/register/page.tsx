import { redirect } from "next/navigation";

// Single-user personal app — registration is disabled.
// Create your account via: npx tsx prisma/create-user.ts
export default function RegisterPage() {
  redirect("/login");
}
