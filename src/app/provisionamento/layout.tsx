import "server-only";

import { AsideProvisioningMenu } from "@/components/AsideProvisioningMenu";
import styles from "./styles..module.scss";
import { ReactNode } from "react";
import { getAllVendors } from "@/utils/getAllVendors";

export default async function ProvisioningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const allVendors:
    | Array<{
        name: string;
        relatedAds: {
          name: string;
        }[];
      }>
    | {} = await getAllVendors();
  return (
    <main className={styles["ProvisioningWrapper"]}>
      <AsideProvisioningMenu items={allVendors} />
      {children}
    </main>
  );
}
