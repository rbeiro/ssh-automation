import { ReactNode } from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

import styles from "./styles.module.scss";
import { PrimaryButton } from "../PrimaryButton";

type BaseProps = {
  title: string;
  children: ReactNode;
};

export const DialogPortal = ({ title, children }: BaseProps) => {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className={styles["LoginDialogOverlay"]} />
      <RadixDialog.Content className={styles["LoginDialogContent"]}>
        <RadixDialog.Close asChild>
          <button className={styles["LoginDialogClose"]}>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 32 32"
                aria-hidden="true"
                role="presentation"
                focusable="false"
                className={styles["CloseIcon"]}
              >
                <path d="m6 6 20 20M26 6 6 26"></path>
              </svg>
            </span>
          </button>
        </RadixDialog.Close>
        <RadixDialog.Title className={styles["LoginDialogTitle"]}>
          {title}
        </RadixDialog.Title>
        <RadixDialog.Description
          className={styles["LoginDialogDescription"]}
          asChild
        >
          {children}
        </RadixDialog.Description>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
};
