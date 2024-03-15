import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "./styles.module.scss";
import { api } from "@/lib/axios";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useAtom, useAtomValue } from "jotai";

import toast from "react-hot-toast";
import { selectedUnprovisionedONTAtom } from "@/lib/jotai/provisioningStore";

const provisioningSchema = z.object({
  serialNumber: z.string(),
  slotGPON: z.string(),
  PONport: z.string(),
  ONUposition: z.string(),
  QoSProfilePPPoE: z.string(),
  VLANClient: z.string(),
  clientNameOLT: z.string(),
  clientNameOLT2: z.string(),
  currentAdsName: z.string(),
  currentVendorName: z.string(),
});

type ProvisioningFormInput = z.input<typeof provisioningSchema>;

interface ProvisioningFormProps {
  currentAdsName: string;
  currentVendorName: string;
  onFormResult?: (data: { id: string; line: string }[] | null) => void;
}

export const ProvisioningForm = ({
  currentAdsName,
  currentVendorName,
  onFormResult,
}: ProvisioningFormProps) => {
  const selectedUnprovisionedONT = useAtomValue(selectedUnprovisionedONTAtom);
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProvisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      currentAdsName,
      currentVendorName,
    },
  });

  useEffect(() => {
    if (selectedUnprovisionedONT) {
      setValue("serialNumber", selectedUnprovisionedONT.serialNumber);
      setValue("slotGPON", selectedUnprovisionedONT.slotGPON);
      setValue("PONport", selectedUnprovisionedONT.PONport);
      setValue("ONUposition", selectedUnprovisionedONT.ONUposition);
    }
  }, [selectedUnprovisionedONT, setValue]);

  async function handleProvisioning(data: ProvisioningFormInput) {
    setIsLoading(true);
    onFormResult && onFormResult(null);
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
          onFormResult && onFormResult(response.data.commandLineResult);
          toast.success("Comando executado");
        }
      })
      .finally(() => setIsLoading(false));
  }
  return (
    <form
      className={styles.ProvisioningForm}
      onSubmit={handleSubmit(handleProvisioning)}
    >
      <Input label="Serial Number da ONT" {...register("serialNumber")} />
      <Input label="Slot GPON" {...register("slotGPON")} />
      <Input label="Porta PON" {...register("PONport")} />
      <Input label="Posição da ONU" {...register("ONUposition")} />
      <Input
        label="Perfil de banda QoS Upstream PPoE"
        defaultValue={"HSI_1G_UP"}
        {...register("QoSProfilePPPoE")}
      />
      <Input label="VLAN Client PPPoE" {...register("VLANClient")} />
      <Input
        label="Descrição assinante"
        placeholder="Identificação do Assinante na OLT"
        {...register("clientNameOLT")}
      />
      <Input
        label="Identificação do Assinante na CTO"
        {...register("clientNameOLT2")}
      />
      <div className={styles.formButton}>
        <PrimaryButton type="submit" isLoading={isLoading}>
          Provisionar
        </PrimaryButton>
      </div>
    </form>
  );
};
