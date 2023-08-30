"use client";

import { Button, Ripple, type ButtonProps } from "@rbeiro-ui/react-components";
import Link from "next/link";
import { HTMLAttributes } from "react";

type StyledLink<T> = ButtonProps<T> & {
  href: string;
};

export const PrimaryButton = <T,>({
  children,
  isLoading,
  href,
  ...props
}: StyledLink<T>) => {
  return (
    <Button.Root asChild>
      <Link href={href}>
        <Button.Content>{children}</Button.Content>
      </Link>
    </Button.Root>
  );
};
