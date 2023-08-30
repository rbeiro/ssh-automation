import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "./styles.module.scss";
import { api } from "@/lib/axios";
import { Input } from "../Input";
import { PrimaryButton } from "../PrimaryButton";

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

interface ProvisioningFormProps {
  onFormResult: (data: { id: string; line: string }[] | null) => void;
  unprovisionedONUData?: {
    serialNumber: string;
    slotGPON: string;
    PONport: string;
  };
}

export const ProvisioningForm = ({
  unprovisionedONUData,
  onFormResult,
}: ProvisioningFormProps) => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<ProvisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      serialNumber: "",
      slotGPON: "",
      PONport: "",
      ONUposition: "",
      QoSProfilePPPoE: "HSI_1G_UP",
      VLANClient: "",
      clientNameOLT: "",
      clientNameOLT2: "",
    },
  });

  useEffect(() => {
    if (unprovisionedONUData) {
      setValue("serialNumber", unprovisionedONUData.serialNumber);
      setValue("slotGPON", unprovisionedONUData.slotGPON);
      setValue("PONport", unprovisionedONUData.PONport);
    }
  }, [unprovisionedONUData, setValue]);

  async function handleProvising(data: ProvisioningFormInput) {
    setIsLoading(true);
    onFormResult(null);
    api
      .post(
        "/provisioning",
        {
          params: data,
        },
        { timeout: 60000 }
      )
      .then((response) => {
        if (response.status == 201) {
          onFormResult(response.data.commandLineResult);
          setStatus("ok");
        }
      })
      .finally(() => setIsLoading(false));
  }
  return (
    <form className={styles.form} onSubmit={handleSubmit(handleProvising)}>
      <Input label="Serial Number da ONT" {...register("serialNumber")} />
      <Input label="Slot GPON" {...register("slotGPON")} />
      <Input label="Porta PON" {...register("PONport")} />
      <Input label="Posição da ONU" {...register("ONUposition")} />
      <Input
        label="Perfil de banda QoS Upstream PPoE"
        {...register("QoSProfilePPPoE")}
      />
      <Input label="VLAN Client PPPoE" {...register("VLANClient")} />
      <Input
        label="Descrição para Identificação do Assinante na OLT"
        {...register("clientNameOLT")}
      />
      <Input
        label="Descrição para Identificação do Assinante na CTO e/ou 2ª descrição"
        {...register("clientNameOLT2")}
      />
      <div className={styles.formButton}>
        <PrimaryButton type="submit" isLoading={isLoading}>
          Provisionar
        </PrimaryButton>
        {status && status}
      </div>
    </form>
  );
};
