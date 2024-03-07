import { Input as InputBase } from "@rbeiro-ui/react-components";
import React, { HTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

import styles from "./styles.module.scss";

interface InputProps extends HTMLAttributes<HTMLInputElement> {
  label: string;
  placeholder?: string;
  errorMessage?: string;
}

const Input = React.forwardRef(
  (
    { label, placeholder, onChange, errorMessage, ...props }: InputProps,
    forwardedRef
  ) => {
    console.log(onChange);
    return (
      <InputBase.Root>
        <InputBase.Content className={styles["InputContainer"]}>
          <InputBase.DefaultField
            placeholder={placeholder}
            ref={forwardedRef}
            onChange={onChange}
            className={styles["InputField"]}
            {...props}
          />
          <InputBase.Label className={styles["InputLabel"]}>
            {label}
          </InputBase.Label>
        </InputBase.Content>

        <InputBase.Error>{errorMessage}</InputBase.Error>
      </InputBase.Root>
    );
  }
);
Input.displayName = "Input";

export { Input };
