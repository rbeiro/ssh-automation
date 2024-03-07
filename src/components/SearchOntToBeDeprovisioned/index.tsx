"use client";

import styles from "./styles.module.scss";
import { useState } from "react";
import { useSetAtom } from "jotai";
import { getOntSerialNumberFromCommandLine } from "@/utils/getOntSerialNumberFromCommandLine";
import { selectedOntToBeDeprovisionedAtom } from "@/lib/jotai/provisioningStore";
import { Input } from "../Input";
import { PrimaryButton } from "../PrimaryButton";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoadingSpinner } from "@rbeiro-ui/react-components";
import { api } from "@/lib/axios";

const provisioningSchema = z.object({
  serialNumber: z.string(),
  currentAdsName: z.string(),
  currentVendorName: z.string(),
});

type UnprovisioningFormInput = z.input<typeof provisioningSchema>;

interface BaseProps {
  currentAdsName: string;
  currentVendorName: string;
}

export const SearchOntToBeDeprovisioned = ({
  currentAdsName,
  currentVendorName,
}: BaseProps) => {
  const [isGettingOnuPosition, setIsGettingOnuPosition] = useState(false);
  const [isFetchingOnt, setIsFetchingOnt] = useState(false);
  const setSelectedOntToBeDeprovisioned = useSetAtom(
    selectedOntToBeDeprovisionedAtom
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UnprovisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      currentAdsName,
      currentVendorName,
      serialNumber: "C4B5EA0",
    },
  });

  function locations(substring: string, string: string) {
    var a = [],
      i = -1;
    while ((i = string.indexOf(substring, i + 1)) >= 0) a.push(i);
    return a;
  }

  async function handleOntSelection(string: string) {
    const serialNumberWithTwoDots = getOntSerialNumberFromCommandLine(string);
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
  }

  function handleSearchForOnt(data: UnprovisioningFormInput) {
    setIsFetchingOnt(true);
    api
      .post(
        "/getOntBySerialNumber",
        {
          params: data,
        },
        { timeout: 60000 }
      )
      .then((response) => {
        console.log(response);
      })
      .finally(() => setIsFetchingOnt(false));
  }

  return (
    <aside className={styles["Container"]}>
      <h1>Procure uma ONT na {currentAdsName}:</h1>
      <div>
        <ul className={styles["CommandLineResult"]}>
          <form
            className={styles.SearchOntForm}
            onSubmit={handleSubmit(handleSearchForOnt)}
          >
            <Input
              label="Número de serial"
              {...register("serialNumber")}
              placeholder="ALCL1234567"
            />
            <PrimaryButton type="submit" isLoading={isFetchingOnt}>
              <MagnifyingGlassIcon />
              Pesquisar
            </PrimaryButton>
          </form>
          {/* {isThereAvailablesOnts &&
            listOfAllOnts &&
            listOfAllOnts.map(({ id, line }) => {
              if (!line.includes("ALCL")) return;

              const serialNumberWithTwoDots =
                getOntSerialNumberFromCommandLine(line);

              return (
                <li key={id} className={styles["UnprovisionedOntsLisItem"]}>
                  <span>{serialNumberWithTwoDots}</span>
                  <PrimaryButton
                    size="xs"
                    isLoading={isGettingOnuPosition}
                    onClick={() => handleOntSelection(line)}
                  >
                    Adicionar ao formulário
                  </PrimaryButton>
                </li>
              );
            })} */}
          {/* {noOntAvailable && <li>Nenhuma ONT encontrada</li>} */}
        </ul>
      </div>
    </aside>
  );
};
