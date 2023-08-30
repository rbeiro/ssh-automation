"use client";
import { BaseSyntheticEvent, useCallback, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import useSearchParams from "@/utils/useSearchParams";

import { PrimaryButton } from "@/components/PrimaryButton";
import { AccordionTrigger } from "./components/AccordionTrigger";
import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { PlusCircledIcon } from "@radix-ui/react-icons";

import styles from "./styles.module.scss";
import { DialogPortal } from "@/components/Dialog";
import { Input } from "@/components/Input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const oltCreationSchema = z.object({
  name: z.string(),
});

type OltCreationFormInput = z.input<typeof oltCreationSchema>;

type BaseProps = {
  items:
    | Array<{
        name: string;
        relatedAds: {
          name: string;
        }[];
      }>
    | {};
};

export const AsideProvisioningMenu = ({ items }: BaseProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  const { data: initialReactQueryData } = useQuery({
    queryKey: ["olt"],
    queryFn: (params) => {
      return api.post("/createNewOLT", params);
    },
    initialData: items,
    enabled: false,
  });
  const mutation = useMutation({
    mutationFn: (params) => {
      return api.post("/createNewOLT", params);
    },

    onMutate: async ({ name }: { name: string }) => {
      await queryClient.cancelQueries({ queryKey: ["olt"] });

      const previousOltData = queryClient.getQueryData<typeof items>(["olt"]);

      queryClient.setQueryData(["olt"], (oldData: any) => [
        ...oldData,
        { name, relatedAds: [] },
      ]);

      return { previousOltData };
    },

    onError: (err, newItem, context: any) => {
      queryClient.setQueryData(["olt"], context.previousOltData);
    },
    onSuccess: () => {
      setIsDialogOpen(false);
      setValue("name", "");
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["olt"] });
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<OltCreationFormInput>({
    resolver: zodResolver(oltCreationSchema),
    defaultValues: {
      name: "",
    },
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;

  const { data: session } = useSession();

  const createQueryString = useCallback(
    (paramsToCreate: Array<{ name: string; value: string }>) => {
      const params = new URLSearchParams(searchParams);
      paramsToCreate.forEach(({ name, value }) => {
        params.set(name, value);
      });

      return params.toString();
    },
    [searchParams]
  );

  function onItemSelection(accordionTitle: string, itemName: string) {
    router.push(
      pathname +
        "?" +
        createQueryString([
          { name: "currentADSName", value: itemName },
          {
            name: "currentADSNumber",
            value: accordionTitle.match(/\d+/g)?.join("") || "",
          },
        ])
    );
  }

  async function handleOltCreation({ name }: OltCreationFormInput) {
    mutation.mutateAsync({
      name,
    });
  }
  return (
    <aside className={styles["AsideContainer"]}>
      <nav className={styles["AsideWrapper"]}>
        <Accordion.Root
          className={styles.AccordionRoot}
          type="single"
          defaultValue="item-1"
          collapsible
          asChild
        >
          <ul>
            {Array.isArray(initialReactQueryData) ? (
              initialReactQueryData.map(({ name, relatedAds }, index) => (
                <AccordionTrigger
                  key={name}
                  onItemSelection={onItemSelection}
                  value={`item-${index + 1}`}
                  options={relatedAds}
                >
                  {name}
                </AccordionTrigger>
              ))
            ) : (
              <li className={styles["NotFound"]}>Nada encontrado</li>
            )}
          </ul>
        </Accordion.Root>
        {session?.user.role === "SUPERADMIN" && (
          <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <Dialog.Trigger asChild>
              <div>
                <PrimaryButton size="sm" full isLoading={isSubmitting}>
                  <PlusCircledIcon />
                  Adicionar nova OLT
                </PrimaryButton>
              </div>
            </Dialog.Trigger>

            <DialogPortal title="Adicionar nova OLT">
              <form
                className={styles["DialogContent"]}
                onSubmit={handleSubmit(handleOltCreation)}
              >
                <Input label="Nome" placeholder="Nokia" {...register("name")} />

                <PrimaryButton
                  size="sm"
                  full
                  type="submit"
                  isLoading={mutation.isLoading}
                >
                  Adicionar
                </PrimaryButton>
              </form>
            </DialogPortal>
          </Dialog.Root>
        )}
      </nav>
    </aside>
  );
};
