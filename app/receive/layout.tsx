import { Suspense } from "react";

function FallBack() {
  return <>Receive Page</>;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<FallBack />}>{children}</Suspense>;
}
