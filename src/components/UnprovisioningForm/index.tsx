import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "./styles.module.scss";
import { api } from "@/lib/axios";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/PrimaryButton";
import toast from "react-hot-toast";

const provisioningSchema = z.object({
  slotGPON: z.string(),
  PONport: z.string(),
  ONUposition: z.string(),
});

type UnProvisioningFormInput = z.input<typeof provisioningSchema>;

interface UnProvisioningFormProps {
  currentAdsName: string;
  currentVendorName: string;
  onFormResult?: (data: { id: string; line: string }[] | null) => void;
}

export const UnProvisioningForm = ({
  onFormResult,
}: UnProvisioningFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<UnProvisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
  });

  async function handleUnprovising(data: UnProvisioningFormInput) {
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
      onSubmit={handleSubmit(handleUnprovising)}
    >
      <Input label="Slot GPON" {...register("slotGPON")} />
      <Input label="Porta PON" {...register("PONport")} />
      <Input label="Posição da ONU" {...register("ONUposition")} />

      <div className={styles.formButton}>
        <PrimaryButton type="submit" isLoading={isLoading}>
          Provisionar
        </PrimaryButton>
      </div>
    </form>
  );
};
