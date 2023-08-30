import { LoadingSpinner } from "@rbeiro-ui/react-components";

import styles from "./styles.module.scss";

interface CommandLineProps {
  commandLineResult:
    | {
        id: string;
        line: string;
      }[]
    | null;
  isLoading: boolean;
}

export const CommandLine = ({
  commandLineResult,
  isLoading,
}: CommandLineProps) => {
  return (
    <ul className={styles["CommandLine"]}>
      {commandLineResult &&
        commandLineResult.map(({ id, line }) => {
          return <li key={id}>{line}</li>;
        })}

      {!commandLineResult && isLoading && <LoadingSpinner />}
      {!commandLineResult && !isLoading && <li>Nenhum resultado ainda...</li>}
    </ul>
  );
};
