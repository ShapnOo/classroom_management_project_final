import { redirect } from "next/navigation";

export default async function DashboardBasePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = await searchParams;
  const role = resolvedParams?.role || "admin";
  redirect(`/dashboard/${role}`);
}
