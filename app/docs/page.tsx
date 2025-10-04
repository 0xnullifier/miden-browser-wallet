import { Concepts } from "@/components/docs/concepts";
import { QuickStart } from "@/components/docs/quickstart";
import { UseCase } from "@/components/docs/use-case";
import React from "react";

export default function Dashboard() {
  return (
    <div className="w-full overflow-hidden">
      <QuickStart />
      <Concepts />
      <UseCase />
    </div>
  );
}
