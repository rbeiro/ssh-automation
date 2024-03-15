"use client";

import { useSession } from "next-auth/react";
import styles from "./styles..module.scss";

import useSearchParams from "@/utils/useSearchParams";
import { useEffect, useState } from "react";
import { UnProvisioningForm } from "../components/UnprovisioningForm";
import { CommandLine } from "@/components/CommandLine";
import { SearchOntToBeDeprovisioned } from "../components/SearchOntToBeDeprovisioned";

export const revalidate = 10;

export default function ProvisioningPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [currentAdsData, setCurrentAdsData] = useState({
    currentADSNumber: "",
    currentVendorName: "",
  });

  const [commandLineResult, setCommandLineResult] = useState<
    { id: string; line: string }[] | null
  >(null);

  useEffect(() => {
    setCurrentAdsData({
      currentADSNumber: searchParams.get("currentADSNumber") || "",
      currentVendorName: searchParams.get("currentADSName") || "",
    });
  }, [searchParams]);

  const isUserLoggedOut = session?.user === null || session?.user === undefined;
  const doesUserHavePermission =
    session?.user.role === "ADMIN" || session?.user.role === "SUPERADMIN";
  const doesSearchParamsHaveBothParams = Boolean(
    currentAdsData.currentADSNumber && currentAdsData.currentVendorName
  );
  return (
    <>
      <div className={styles["UnprovisioningContainer"]}>
        {(!doesUserHavePermission || isUserLoggedOut) && (
          <h1>Você não possui acesso, faça login</h1>
        )}

        {doesUserHavePermission && doesSearchParamsHaveBothParams && (
          <>
            <div>
              <div className={styles["PageTitle"]}>
                <h1>{currentAdsData.currentVendorName}</h1>
                <h3>ADS {currentAdsData.currentADSNumber}</h3>
              </div>
              <UnProvisioningForm
                currentVendorName={currentAdsData.currentVendorName}
                currentAdsName={`ADS ${currentAdsData.currentADSNumber}`}
                onFormResult={(result) => setCommandLineResult(result)}
              />
            </div>

            <SearchOntToBeDeprovisioned
              currentVendorName={currentAdsData.currentVendorName}
              currentAdsName={`ADS ${currentAdsData.currentADSNumber}`}
            />
          </>
        )}

        {doesUserHavePermission && !doesSearchParamsHaveBothParams && (
          <h2>Selecione uma ADS para iniciar o desprovisionamento</h2>
        )}

        <CommandLine commandLineResult={commandLineResult} isLoading={false} />
      </div>
    </>
  );
}
