import { PrimaryButton } from "@/components/PrimaryButton";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { signOut } from "next-auth/react";

export const SignOutButton = () => {
  return (
    <PrimaryButton onClick={() => signOut()}>
      sair <ArrowRightIcon />
    </PrimaryButton>
  );
};
