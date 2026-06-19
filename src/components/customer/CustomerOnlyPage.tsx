import type { ReactNode } from "react";
import { CustomerAppShell } from "@/components/customer/CustomerAppShell";
import type { CustomerNavTab } from "@/components/customer/customer-shell";

/** Layout for routes that are only accessible to signed-in customers. */
export function CustomerOnlyPage({
  children,
  activeTab,
  mainClassName,
}: {
  children: ReactNode;
  activeTab?: CustomerNavTab;
  mainClassName?: string;
}) {
  return (
    <CustomerAppShell activeTab={activeTab} mainClassName={mainClassName}>
      {children}
    </CustomerAppShell>
  );
}
