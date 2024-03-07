import { signIn } from "next-auth/react";
import styles from "./styles.module.scss";

import * as Dialog from "@radix-ui/react-dialog";
import { PrimaryButton } from "@/components/PrimaryButton";
import { PassCodeInput } from "@/components/PassCodeInput";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { DialogPortal } from "@/components/Dialog";
import { Input } from "@/components/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { SetStateAction } from "jotai";

export const LoginButton = () => {
  useEffect(() => {
    console.log(window.location.origin);
  }, []);
  const [wasConfirmationEmailSent, setWasConfirmationEmailSent] =
    useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  function handleEmailSuccess(email: string) {
    setUserEmail(email);
    setWasConfirmationEmailSent(true);
  }

  function changeUserEmail() {
    setUserEmail("");
    setWasConfirmationEmailSent(false);
  }
  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <Dialog.Trigger asChild>
        <PrimaryButton>Entrar</PrimaryButton>
      </Dialog.Trigger>

      {wasConfirmationEmailSent ? (
        <ConfirmCodeContent
          userEmail={userEmail}
          changeUserEmail={changeUserEmail}
          closeDialog={() => setIsDialogOpen(false)}
        />
      ) : (
        <InsertEmailContent onEmailSent={handleEmailSuccess} />
      )}
    </Dialog.Root>
  );
};

const LoginFormSchema = z.object({
  email: z.string().email(),
});

type LoginFormInput = z.input<typeof LoginFormSchema>;

type InsertEmailContentProps = {
  onEmailSent: (email: string) => void;
};

const InsertEmailContent = ({ onEmailSent }: InsertEmailContentProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormInput>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: "",
    },
  });
  function onEmailSignIn({ email }: LoginFormInput) {
    setIsLoading(true);
    signIn("email", {
      email,
      redirect: false,
    })
      .then(() => onEmailSent(email))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }
  return (
    <DialogPortal title="Entrar">
      <form
        className={styles["DialogContent"]}
        onSubmit={handleSubmit(onEmailSignIn)}
      >
        <Input
          label="E-mail"
          placeholder="joaodasilva@exemplo.com"
          {...register("email")}
        />

        <PrimaryButton size="sm" full type="submit" isLoading={isLoading}>
          Continuar <ArrowRightIcon />
        </PrimaryButton>
      </form>
    </DialogPortal>
  );
};

type ConfirmCodeContentProps = {
  userEmail: string;
  changeUserEmail: () => void;
  closeDialog: () => void;
};

const ConfirmCodeContent = ({
  userEmail,
  changeUserEmail,
  closeDialog,
}: ConfirmCodeContentProps) => {
  const router = useRouter();
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [currentUrlOrigin, setCurrentUrlOrigin] = useState<string>("");
  useEffect(() => {
    setCurrentUrl(window.location.href);
    setCurrentUrlOrigin(window.location.origin);
  }, []);
  const [isVerificationLoading, setIsVerificationLoading] = useState(false);
  const [verificationErrorMessage, setVerificationErrorMessage] = useState("");
  const [verificationSuccessMessage, setVerificationSuccessMessage] =
    useState("");

  function handleChangeUserEmail() {
    changeUserEmail();
  }

  function handleValueEnter(inputValue: string) {
    const verificaitonCode = inputValue;

    setVerificationErrorMessage("");
    setIsVerificationLoading(true);

    const verificationUrl = `${currentUrlOrigin}/api/auth/callback/email?callbackUrl=${currentUrl}&token=${verificaitonCode}&email=${
      userEmail || ""
    }`;
    toast.promise(
      new Promise((resolve, reject) => {
        fetch(verificationUrl)
          .then((data) => {
            console.log(data.status);
            if (data.status !== 200) {
              reject();
              setVerificationErrorMessage(
                "O código é inválido. Tente novamente."
              );
              return;
            } else {
              resolve("Yay");
              setVerificationSuccessMessage(
                "Sucesso! Aguarde o redirecionamento da página..."
              );
              window.location.reload();
            }
          })
          .catch((err) => {
            setVerificationErrorMessage(
              "O código é inválido. Tente novamente."
            );
          });
      }),

      {
        loading: "Carregando...",
        error: <b>Código inválido, tente novamente.</b>,
        success: <b>Logado com sucesso!</b>,
      }
    );
  }
  return (
    <DialogPortal title="Confirme o código">
      <div className={styles["DialogContent"]}>
        <span>
          Insira o códgio enviado para o e-mail <b>{userEmail}</b>{" "}
          <button onClick={handleChangeUserEmail}>Trocar e-mail</button>
        </span>
        <PassCodeInput onMaxCaracters={handleValueEnter} />
      </div>
    </DialogPortal>
  );
};

// <button className={styles["LoginDialogClose"]}>
// <span>
//   <svg
//     xmlns="http://www.w3.org/2000/svg"
//     viewBox="0 0 32 32"
//     aria-hidden="true"
//     role="presentation"
//     focusable="false"
//     className={styles["CloseIcon"]}
//   >
//     <path fill="none" d="M20 28 8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path>
//   </svg>
// </span>
// </button>
