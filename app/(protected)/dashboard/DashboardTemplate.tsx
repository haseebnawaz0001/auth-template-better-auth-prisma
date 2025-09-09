"use client";

export type DashboardTemplateProps = {
  role?: string | null;
  text?: string;
};

export default function DashboardTemplate({ role, text }: DashboardTemplateProps) {
  return (
    <div className="min-h-screen grid place-items-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">{text ?? "Dashboard"}</h1>
        <p className="mt-2 text-muted-foreground">Role: {role ?? "Unknown"}</p>
      </div>
    </div>
  );
}

