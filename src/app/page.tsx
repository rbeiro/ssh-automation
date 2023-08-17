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
  const [unprovisionedONU, setUnprovisionedONU] = useState<
    { id: string; line: string }[] | null
  >(null);

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
  }, []);

  console.log(unprovisionedONU);

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
    const serialNumberWithTwoDots = getSerialNumberFromCommandLine(string);
    const indexesOfSlashes = locations("/", string);
    const slotGPON = string[indexesOfSlashes[1] + 1];
    const PONport = string[indexesOfSlashes[2] + 1];

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

      <ul className={styles.commandLine}>
        {commandLineResult &&
          commandLineResult.map(({ id, line }) => {
            return <li key={id}>{line}</li>;
          })}

        {!commandLineResult && isLoading && <LoadingSpinner />}
        {!commandLineResult && !isLoading && <li>Nenhum resultado ainda...</li>}
      </ul>

      <ul className={styles.commandLine}>
        {isThereUnprovisionedONUs &&
          unprovisionedONU.map(({ id, line }) => {
            if (!line.includes("ALCL")) return;

            const serialNumberWithTwoDots =
              getSerialNumberFromCommandLine(line);

            return (
              <li key={id} className={styles["unprovisioned__result"]}>
                <span>{serialNumberWithTwoDots}</span>
                <Button
                  size="xs"
                  onClick={() => handleUnprovisionedONUAdditionToForm(line)}
                >
                  Adicionar ao formulário
                </Button>
              </li>
            );
          })}

        {!unprovisionedONU && isLoading && <LoadingSpinner />}
        {!unprovisionedONU && !isLoading && <li>Nenhum resultado ainda...</li>}
        {noUnprovisionedONU && <li>Todas ONUs estão provisionadas</li>}
      </ul>
    </main>
  );
}
