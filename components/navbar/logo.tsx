import { Fingerprint } from "lucide-react";

export const Logo = () => (
  <div className="flex flex-row gap-2 items-center">
    <Fingerprint width={32} height={32} />
    <h1 className="text-lg font-semibold tracking-tight">AUTH</h1>
  </div>
);
