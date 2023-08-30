import { Button, Ripple, type ButtonProps } from "@rbeiro-ui/react-components";
import React from "react";

const PrimaryButton = React.forwardRef(
  <T,>({ children, isLoading, ...props }: ButtonProps<T>, ref: any) => {
    return (
      <Button.Root ref={ref} {...props} style={{ backgroundColor: "#1e284f" }}>
        <Button.Content isLoading={isLoading}>{children}</Button.Content>
        <Ripple />
      </Button.Root>
    );
  }
);

PrimaryButton.displayName = "PrimaryButton";

export { PrimaryButton };
