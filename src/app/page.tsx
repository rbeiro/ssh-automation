"use client";

import Image from "next/image";
import styles from "./page.module.scss";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "@/lib/axios";
import { z } from "zod";

import { Button, Input } from "@rbeiro-ui/react-components";
import { useState } from "react";

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
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<ProvisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
  });
  // const { data } = useQuery({
  //   queryKey: ["create-provisioning"],
  //   queryFn: async () =>
  //     await api.post("/provisioning", {
  //       params: {
  //         serialNumber: "ALCL:FC31BF03",
  //         slotGPON: 4,
  //         PONport: 16,
  //         ONUposition: 2,
  //         QoSProfilePPPoE: "HSI_1G_UP",
  //         VLANClient: 10,
  //         clientNameOLT: "TESTE NOKIA AUTO",
  //         clientNameOLT2: "TESTE NOKIA AUTO",
  //       },
  //     }),
  // });
  console.log(errors);

  async function handleProvising(data: ProvisioningFormInput) {
    console.log(data);
    console.log(errors);
    api
      .post("/provisioning", {
        params: data,
      })
      .then((data) => {
        console.log(data);
        if (data.status == 200) {
          setStatus("ok");
        }
      });
  }
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
        <div>
          <Button type="submit">Provisionar</Button>
          {status && status}
        </div>
      </form>
    </main>
  );
}
