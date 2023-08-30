"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import { z } from "zod";

import { Button, Input, LoadingSpinner } from "@rbeiro-ui/react-components";
import { useEffect, useState } from "react";
import { ProvisioningForm } from "@/components/ProvisioningForm";
import { DeprovisionForm } from "@/components/DeprovisionForm";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [formDataFromUnprovisionedONU, setFormDataFromUnprovisionedONU] =
    useState<
      | {
          serialNumber: string;
          slotGPON: string;
          PONport: string;
        }
      | undefined
    >(undefined);
  const [commandLineResult, setCommandLineResult] = useState<
    { id: string; line: string }[] | null
  >(null);
  const [deprovisionCommandLineResult, setDeprovisionCommandLineResult] =
    useState<{ id: string; line: string }[] | null>(null);
  const [unprovisionedONU, setUnprovisionedONU] = useState<
    { id: string; line: string }[] | null
  >([{ id: "teste", line: "176        1/1/1/11   ALCLFC20A863 DEFAULT " }]);

  async function getUnprovisionedONUs() {
    setIsLoading(true);

    setCommandLineResult(null);
    api
      .get(
        "/unprovisioned",

        { timeout: 15000 }
      )
      .then((response) => {
        if (response.status == 201) {
          setUnprovisionedONU(response.data.commandLineResult);
        }
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    getUnprovisionedONUs();
  }, [formDataFromUnprovisionedONU]);

  //console.log(unprovisionedONU);

  const noUnprovisionedONU = unprovisionedONU?.find((string) =>
    string.line.includes("unprovision-onu count : 0")
  );

  const isThereUnprovisionedONUs = !noUnprovisionedONU && unprovisionedONU;

  function getSerialNumberFromCommandLine(line: string) {
    const startOfSerial = line.indexOf("ALCL");
    const serialNumber = line.slice(startOfSerial, startOfSerial + 12);
    const serialNumberWithTwoDots =
      serialNumber.slice(0, 4) + ":" + serialNumber.slice(4);

    return serialNumberWithTwoDots;
  }

  function locations(substring: string, string: string) {
    var a = [],
      i = -1;
    while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
    return a;
  }

  function handleUnprovisionedONUAdditionToForm(string: string) {
    console.log(string);
    const serialNumberWithTwoDots = getSerialNumberFromCommandLine(string);
    const indexesOfSlashes = locations("/", string);

    const doesSecondNumberOfSlotGPONExist = !!Number(
      string[indexesOfSlashes[1] + 2]
    );

    console.log(doesSecondNumberOfSlotGPONExist);
    const slotGPON = doesSecondNumberOfSlotGPONExist
      ? string[indexesOfSlashes[1] + 1] + string[indexesOfSlashes[1] + 2]
      : string[indexesOfSlashes[1] + 1];

    const doesSecondNumberOfPONPortExist = !!Number(
      string[indexesOfSlashes[2] + 2]
    );
    console.log(doesSecondNumberOfPONPortExist);
    const PONport = doesSecondNumberOfPONPortExist
      ? string[indexesOfSlashes[2] + 1] + string[indexesOfSlashes[2] + 2]
      : string[indexesOfSlashes[2] + 1];

    setFormDataFromUnprovisionedONU({
      serialNumber: serialNumberWithTwoDots,
      PONport,
      slotGPON,
    });
  }

  return (
    <main className={styles.main}>
      <ProvisioningForm
        onFormResult={setCommandLineResult}
        unprovisionedONUData={formDataFromUnprovisionedONU}
      />

      <div className={styles.box}>
        <h2>Resultado do formulário acima:</h2>
      </div>

      <DeprovisionForm onFormResult={setDeprovisionCommandLineResult} />

      <div className={styles.box}>
        <h2>Resultado do formulário acima:</h2>
        <ul className={styles.commandLine}>
          {commandLineResult &&
            commandLineResult.map(({ id, line }) => {
              return <li key={id}>{line}</li>;
            })}

          {!deprovisionCommandLineResult && isLoading && <LoadingSpinner />}
          {!deprovisionCommandLineResult && !isLoading && (
            <li>Nenhum resultado ainda...</li>
          )}
        </ul>
      </div>

      <div className={styles.box}>
        <h2>ONUs não provisionadas:</h2>
        <ul className={styles.commandLine}>
          {isThereUnprovisionedONUs &&
            unprovisionedONU.map(({ id, line }) => {
              if (!line.includes("ALCL")) return;

              const serialNumberWithTwoDots =
                getSerialNumberFromCommandLine(line);

              return (
                <li key={id} className={styles["unprovisioned__result"]}>
                  <span>{serialNumberWithTwoDots}</span>
                  <PrimaryButton
                    size="xs"
                    onClick={() =>
                      handleUnprovisionedONUAdditionToForm(
                        "176        1/1/1/11   ALCLFC20A863 DEFAULT"
                      )
                    }
                  >
                    Adicionar ao formulário
                  </PrimaryButton>
                </li>
              );
            })}

          {!unprovisionedONU && isLoading && <LoadingSpinner />}
          {!unprovisionedONU && !isLoading && (
            <li>Nenhum resultado ainda...</li>
          )}
          {noUnprovisionedONU && <li>Todas ONUs estão provisionadas</li>}
        </ul>
      </div>
    </main>
  );
}
