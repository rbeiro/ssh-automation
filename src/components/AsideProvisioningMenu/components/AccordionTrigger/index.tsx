import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronDownIcon, PlusCircledIcon } from "@radix-ui/react-icons";

import styles from "./styles.module.scss";
import useSearchParams from "@/utils/useSearchParams";
import { PrimaryButton } from "@/components/PrimaryButton";
import { useSession } from "next-auth/react";
import { DialogPortal } from "@/components/Dialog";
import { Input } from "@/components/Input";

import useSWR from "swr";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const adsCreationSchema = z.object({
  name: z.string(),
  ipAddress: z.string(),
  port: z.string(),
  vendorName: z.string(),
});

type AdsCreationFormInput = z.input<typeof adsCreationSchema>;

interface BaseProps {
  children: string;
  options: Array<{
    name: string;
  }>;
  value: string;
  vendorName: string;
  onItemSelection?: (itemName: string, accordionTitle: string) => void;
}

export const AccordionTrigger = ({
  children,
  value,
  onItemSelection,
  options,
  vendorName,
}: BaseProps) => {
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  console.log(vendorName);

  const currentADSNumber = searchParams.get("currentADSNumber");
  const currentADSName = searchParams.get("currentADSName");

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const { data: initialReactQueryData } = useQuery({
    queryKey: [`ads-${vendorName}`],
    queryFn: (params) => {
      return api.post("/createNewADS", params);
    },
    initialData: options,
    enabled: false,
  });

  console.log(initialReactQueryData);

  const mutation = useMutation({
    mutationFn: (params) => {
      return api.post("/createNewADS", params);
    },

    onMutate: async ({ name }: AdsCreationFormInput) => {
      await queryClient.cancelQueries({ queryKey: [`ads-${vendorName}`] });

      const previousVendorData = queryClient.getQueryData<typeof options>([
        `ads-${vendorName}`,
      ]);

      queryClient.setQueryData([`ads-${vendorName}`], (oldData: any) => [
        ...oldData,
        { name },
      ]);

      return { previousVendorData };
    },

    onError: (err, newItem, context: any) => {
      if (context) {
        queryClient.setQueryData(
          [`ads-${vendorName}`],
          context.previousVendorData
        );
      }

      console.log(err);
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      resetAdsCreationForm();
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [`ads-${vendorName}`] });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    reset: resetAdsCreationForm,
    formState: { isSubmitting, errors },
  } = useForm<AdsCreationFormInput>({
    resolver: zodResolver(adsCreationSchema),
    defaultValues: {
      name: "",
      ipAddress: "",
      port: "",
      vendorName,
    },
  });

  function handleCreateAds({
    name,
    vendorName,
    ipAddress,
    port,
  }: AdsCreationFormInput) {
    mutation.mutateAsync({
      name,
      vendorName,
      ipAddress,
      port,
    });
  }
  return (
    <Accordion.Item value={value} className={styles.AccordionItem}>
      <Accordion.Header className={styles.AccordionHeader}>
        <Accordion.Trigger className={styles.AccordionTrigger}>
          {children}
          <ChevronDownIcon className={styles.AccordionChevron} aria-hidden />
        </Accordion.Trigger>
      </Accordion.Header>

      <Accordion.Content className={styles.AccordionContent} asChild>
        <ul>
          {initialReactQueryData.map(({ name }, index) => {
            const isCurrentItemSelected =
              currentADSName === children &&
              currentADSNumber === name.match(/\d+/g)?.join("");
            console.log(name);
            return (
              <li
                data-selected={isCurrentItemSelected}
                className={styles.MenuOption}
                key={name}
                onClick={() => {
                  if (onItemSelection) onItemSelection(name, children);
                }}
              >
                {name}
              </li>
            );
          })}

          {session?.user.role === "SUPERADMIN" && (
            <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <Dialog.Trigger asChild>
                <div>
                  <PrimaryButton size="sm" full>
                    <PlusCircledIcon />
                    Adicionar nova ADS
                  </PrimaryButton>
                </div>
              </Dialog.Trigger>

              <DialogPortal title="Adicionar nova ADS">
                <form
                  className={styles["DialogContent"]}
                  onSubmit={handleSubmit(handleCreateAds)}
                >
                  <Input
                    label="Nome"
                    placeholder="ADS 11"
                    {...register("name")}
                  />
                  <Input
                    label="Endereço IP"
                    placeholder="123.456.789.0"
                    {...register("ipAddress")}
                  />
                  <Input
                    label="Porta"
                    placeholder="12345"
                    {...register("port")}
                  />

                  <PrimaryButton size="sm" full type="submit">
                    Adicionar
                  </PrimaryButton>
                </form>
              </DialogPortal>
            </Dialog.Root>
          )}
        </ul>
      </Accordion.Content>
    </Accordion.Item>
  );
};
