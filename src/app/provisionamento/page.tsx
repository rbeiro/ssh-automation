"use client";

import { useSession } from "next-auth/react";
import { ProvisioningForm } from "./components/ProvisioningForm";
import { UnprovisionedOnts } from "./components/UnprovisionedOnts";
import styles from "./styles..module.scss";

import useSearchParams from "@/utils/useSearchParams";

import toast, { Toaster } from "react-hot-toast";
import { CommandLine } from "@/components/CommandLine";
import { useEffect, useState } from "react";

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
      <div className={styles["ProvisioningContainer"]}>
        <Toaster />
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
              <ProvisioningForm
                currentVendorName={currentAdsData.currentVendorName}
                currentAdsName={`ADS ${currentAdsData.currentADSNumber}`}
                onFormResult={(result) => setCommandLineResult(result)}
              />
            </div>

            <UnprovisionedOnts
              currentVendorName={currentAdsData.currentVendorName}
              currentAdsName={`ADS ${currentAdsData.currentADSNumber}`}
            />
          </>
        )}

        {doesUserHavePermission && !doesSearchParamsHaveBothParams && (
          <h2>Selecione uma ADS para iniciar o provisionamento</h2>
        )}

        <CommandLine commandLineResult={commandLineResult} isLoading={false} />
      </div>
    </>
  );
}
