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

const provisioningSchema = z.object({
  serialNumber: z.string(),
  slotGPON: z.string(),
  PONport: z.string(),
  ONUposition: z.string(),
  QoSProfilePPPoE: z.string(),
  VLANClient: z.string(),
  clientNameOLT: z.string(),
  clientNameOLT2: z.string(),
});

type ProvisioningFormInput = z.input<typeof provisioningSchema>;

export default function Home() {
  const [status, setStatus] = useState("");
  const [commandLineResult, setCommandLineResult] = useState<
    { id: string; line: string }[] | null
  >(null);
  const [unprovisionedONU, setUnprovisionedONU] = useState<
    { id: string; line: string }[] | null
  >(null);

  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ProvisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      serialNumber: "ALCL:FC598766",
      slotGPON: "4",
      PONport: "4",
      ONUposition: "2",
      QoSProfilePPPoE: "HSI_1G_UP",
      VLANClient: "10",
      clientNameOLT: "TESTE - FORMULARIO",
      clientNameOLT2: "GABRIEL",
    },
  });

  async function handleProvising(data: ProvisioningFormInput) {
    setIsLoading(true);
    setCommandLineResult(null);
    api
      .post(
        "/provisioning",
        {
          params: data,
        },
        { timeout: 15000 }
      )
      .then((response) => {
        if (response.status == 201) {
          setCommandLineResult(response.data.commandLineResult);
          setStatus("ok");
        }
      })
      .finally(() => setIsLoading(false));
  }
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
          setStatus("peguei");
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

  return (
    <main className={styles.main}>
      <form className={styles.form} onSubmit={handleSubmit(handleProvising)}>
        <Input labelName="Serial Number da ONT" {...register("serialNumber")} />
        <Input labelName="Slot GPON" {...register("slotGPON")} />
        <Input labelName="Porta PON" {...register("PONport")} />
        <Input labelName="Posição da ONU" {...register("ONUposition")} />
        <Input
          labelName="Perfil de banda QoS Upstream PPoE"
          {...register("QoSProfilePPPoE")}
        />
        <Input labelName="VLAN Client PPPoE" {...register("VLANClient")} />
        <Input
          labelName="Descrição para Identificação do Assinante na OLT"
          {...register("clientNameOLT")}
        />
        <Input
          labelName="Descrição para Identificação do Assinante na CTO e/ou 2ª descrição"
          {...register("clientNameOLT2")}
        />
        <div className={styles.formButton}>
          <Button type="submit" isLoading={isLoading}>
            Provisionar
          </Button>
          {status && status}
        </div>
      </form>

      <ul className={styles.commandLine}>
        {commandLineResult &&
          commandLineResult.map(({ id, line }) => {
            return <li key={id}>{line}</li>;
          })}

        {!commandLineResult && isLoading && <LoadingSpinner />}
        {!commandLineResult && !isLoading && <li>Nenhum resultado ainda...</li>}
      </ul>

      <ul className={styles.commandLine}>
        {!noUnprovisionedONU &&
          unprovisionedONU &&
          unprovisionedONU.map(({ id, line }) => {
            return <li key={id}>{line}</li>;
          })}

        {!unprovisionedONU && isLoading && <LoadingSpinner />}
        {!unprovisionedONU && !isLoading && <li>Nenhum resultado ainda...</li>}
        {noUnprovisionedONU && <li>Todas ONUs estão provisionadas</li>}
      </ul>
    </main>
  );
}
