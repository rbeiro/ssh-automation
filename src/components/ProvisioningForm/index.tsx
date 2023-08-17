import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@rbeiro-ui/react-components";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "./styles.module.scss";
import { api } from "@/lib/axios";

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
        { timeout: 15000 }
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
  );
};
