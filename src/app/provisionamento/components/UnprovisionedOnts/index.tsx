"use client";

import { PrimaryButton } from "@/components/PrimaryButton";
import styles from "./styles.module.scss";
import { useEffect, useState } from "react";
import { useAtom } from "jotai";
import { selectedUnprovisionedONTAtom } from "@/lib/jotaiAtoms";
import { api } from "@/lib/axios";
import { LoadingSpinner } from "@rbeiro-ui/react-components";
import { useSearchParams } from "next/navigation";

interface BaseProps {
  currentAdsName: string;
  currentVendorName: string;
}

export const UnprovisionedOnts = ({
  currentAdsName,
  currentVendorName,
}: BaseProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGettingOnuPosition, setIsGettingOnuPosition] = useState(false);
  const [selectedUnprovisionedONT, setSelectedUnprovisionedONT] = useAtom(
    selectedUnprovisionedONTAtom
  );

  const [commandLineResult, setCommandLineResult] = useState<
    { id: string; line: string }[] | null
  >(null);

  const [unprovisionedONU, setUnprovisionedONU] = useState<
    { id: string; line: string }[] | null
  >(null);
  function locations(substring: string, string: string) {
    var a = [],
      i = -1;
    while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
    return a;
  }
  function getSerialNumberFromCommandLine(line: string) {
    const startOfSerial = line.indexOf("ALCL");
    const serialNumber = line.slice(startOfSerial, startOfSerial + 12);
    const serialNumberWithTwoDots =
      serialNumber.slice(0, 4) + ":" + serialNumber.slice(4);

    return serialNumberWithTwoDots;
  }
  async function handleUnprovisionedONUAdditionToForm(string: string) {
    const serialNumberWithTwoDots = getSerialNumberFromCommandLine(string);
    const indexesOfSlashes = locations("/", string);

    const doesSecondNumberOfSlotGPONExist =
      !!Number(string[indexesOfSlashes[1] + 2]) ||
      Number(string[indexesOfSlashes[1] + 2]) === 0;

    const slotGPON = doesSecondNumberOfSlotGPONExist
      ? string[indexesOfSlashes[1] + 1] + string[indexesOfSlashes[1] + 2]
      : string[indexesOfSlashes[1] + 1];

    const doesSecondNumberOfPONPortExist =
      !!Number(string[indexesOfSlashes[2] + 2]) ||
      Number(string[indexesOfSlashes[2] + 2]) === 0;

    const PONport = doesSecondNumberOfPONPortExist
      ? string[indexesOfSlashes[2] + 1] + string[indexesOfSlashes[2] + 2]
      : string[indexesOfSlashes[2] + 1];

    const currentLastOnuPosition = await getLastOnuPosition({
      currentAdsName,
      currentVendorName,
      slotGPON: slotGPON,
      PONport: PONport,
    });

    setSelectedUnprovisionedONT({
      serialNumber: serialNumberWithTwoDots,
      PONport,
      slotGPON,
      ONUposition: String((currentLastOnuPosition || 0) + 1) || "",
    });
  }

  const noUnprovisionedONU = unprovisionedONU?.find((string) =>
    string.line.includes("unprovision-onu count : 0")
  );

  async function getLastOnuPosition(data: {
    currentAdsName: string;
    currentVendorName: string;
    slotGPON: string;
    PONport: string;
  }) {
    setIsGettingOnuPosition(true);
    return api
      .post(
        "/getAdsPosition",
        {
          params: {
            currentAdsName: data.currentAdsName,
            currentVendorName: data.currentVendorName,
            slotGPON: data.slotGPON,
            PONport: data.PONport,
          },
        },

        { timeout: 15000 }
      )
      .then(
        ({
          data,
          status,
        }: {
          data: { commandLineResult: Array<{ id: string; line: string }> };
          status: number;
        }) => {
          if (status == 201) {
            let ponCount;
            data.commandLineResult.forEach(({ line }) => {
              if (line.includes("pon count")) {
                ponCount = line.match(/\d+/g)?.join("");
              }
            });

            const foundOnts = data.commandLineResult.filter(({ line }) => {
              if (line.includes("ALCL")) {
                return line;
              }
            });
            if (!ponCount) return;
            const lastFoundOnt = foundOnts[Number(ponCount - 1)];

            const indexesOfSlashes = locations("/", lastFoundOnt.line);
            const doesSecondNumberOfSlotGPONExist =
              !!Number(lastFoundOnt.line[indexesOfSlashes[6] + 2]) ||
              Number(lastFoundOnt.line[indexesOfSlashes[6] + 2]) === 0;

            return doesSecondNumberOfSlotGPONExist
              ? Number(
                  lastFoundOnt.line[indexesOfSlashes[6] + 1] +
                    lastFoundOnt.line[indexesOfSlashes[6] + 2]
                )
              : Number(lastFoundOnt.line[indexesOfSlashes[6] + 1]);
          }
        }
      )
      .finally(() => setIsGettingOnuPosition(false));
  }

  const isThereUnprovisionedONUs = !noUnprovisionedONU && unprovisionedONU;

  useEffect(() => {
    async function getUnprovisionedONUs() {
      setUnprovisionedONU(null);
      setIsLoading(true);
      console.log(isLoading);

      api
        .post(
          "/unprovisioned",
          {
            params: {
              currentAdsName,
              currentVendorName,
            },
          },

          { timeout: 15000 }
        )
        .then((response) => {
          if (response.status == 201) {
            setUnprovisionedONU(
              currentAdsName === "ADS 10"
                ? [
                    {
                      id: "teste",
                      line: "176        1/1/1/11   ALCLFC20A863 DEFAULT ",
                    },
                  ]
                : response.data.commandLineResult
            );
          }
        })
        .finally(() => setIsLoading(false));
    }
    getUnprovisionedONUs();
  }, [currentAdsName, currentVendorName]);

  return (
    <aside className={styles["Container"]}>
      <h1>ONTs não provisionadas:</h1>
      <div>
        <ul className={styles["CommandLineResult"]}>
          {isThereUnprovisionedONUs &&
            unprovisionedONU &&
            unprovisionedONU.map(({ id, line }) => {
              if (!line.includes("ALCL")) return;

              const serialNumberWithTwoDots =
                getSerialNumberFromCommandLine(line);

              return (
                <li key={id} className={styles["UnprovisionedOntsLisItem"]}>
                  <span>{serialNumberWithTwoDots}</span>
                  <PrimaryButton
                    size="xs"
                    isLoading={isGettingOnuPosition}
                    onClick={() => handleUnprovisionedONUAdditionToForm(line)}
                  >
                    Adicionar ao formulário
                  </PrimaryButton>
                </li>
              );
            })}

          {isLoading && (
            <div className={styles["LoadingCommand"]}>
              Carregando <LoadingSpinner />
            </div>
          )}
          {noUnprovisionedONU && <li>Todas ONUs estão provisionadas</li>}
        </ul>
      </div>
    </aside>
  );
};
