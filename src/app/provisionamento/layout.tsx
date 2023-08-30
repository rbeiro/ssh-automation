import "server-only";

import { AsideProvisioningMenu } from "@/components/AsideProvisioningMenu";
import styles from "./styles..module.scss";
import { ReactNode } from "react";
import { getAllOLT } from "@/utils/getAllOLTs";

export default async function ProvisioningLayout({
  children,
}: {
  children: ReactNode;
}) {
  const allOlts:
    | Array<{
        name: string;
        relatedAds: {
          name: string;
        }[];
      }>
    | {} = await getAllOLT();
  console.log(allOlts);
  return (
    <main className={styles["ProvisioningWrapper"]}>
      <AsideProvisioningMenu items={allOlts} />
      {children}
    </main>
  );
}
