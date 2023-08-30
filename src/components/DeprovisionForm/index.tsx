import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import styles from "./styles.module.scss";
import { api } from "@/lib/axios";
import { Input } from "../Input";
import { PrimaryButton } from "../PrimaryButton";

const provisioningSchema = z.object({
  slotGPON: z.string(),
  PONport: z.string(),
  ONUposition: z.string(),
});

type ProvisioningFormInput = z.input<typeof provisioningSchema>;

interface ProvisioningFormProps {
  onFormResult: (data: { id: string; line: string }[] | null) => void;
}

export const DeprovisionForm = ({ onFormResult }: ProvisioningFormProps) => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<ProvisioningFormInput>({
    resolver: zodResolver(provisioningSchema),
    defaultValues: {
      slotGPON: "",
      PONport: "",
      ONUposition: "",
    },
  });

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
      <Input label="Slot GPON" {...register("slotGPON")} />
      <Input label="Porta PON" {...register("PONport")} />
      <Input label="Posição da ONU" {...register("ONUposition")} />

      <div className={styles.formButton}>
        <PrimaryButton type="submit" isLoading={isLoading}>
          Desprovisionar
        </PrimaryButton>
        {status && status}
      </div>
    </form>
  );
};
