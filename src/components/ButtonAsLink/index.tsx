import { Button, Ripple, type ButtonProps } from "@rbeiro-ui/react-components";
import Link from "next/link";
import React from "react";

type BaseProps<T> = ButtonProps<T> & {
  href: string;
};

const ButtonAsLink = React.forwardRef(
  <T,>({ children, href, isLoading, ...props }: BaseProps<T>, ref: any) => {
    return (
      <Button.Root
        asChild
        ref={ref}
        {...props}
        style={{ backgroundColor: "#1e284f" }}
      >
        <Link href={href}>
          <Button.Content isLoading={isLoading}>{children}</Button.Content>
          <Ripple />
        </Link>
      </Button.Root>
    );
  }
);

ButtonAsLink.displayName = "ButtonAsLink";

export { ButtonAsLink };
