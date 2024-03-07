import { PrimaryButton } from "@/components/PrimaryButton";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import { signOut, useSession } from "next-auth/react";

export const SignOutButton = () => {
  const { data: session } = useSession();
  console.log(session);
  return (
    <PrimaryButton onClick={() => signOut()}>
      sair <ArrowRightIcon />
    </PrimaryButton>
  );
};
