import { Button, Ripple, type ButtonProps } from "@rbeiro-ui/react-components";

import styles from "./styles.module.scss";
import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export const SwitchTheme = () => {
  const { theme, systemTheme, setTheme, resolvedTheme } = useTheme();
  const [iconsWheelRotationDegree, setIconsWheelRotationDegree] = useState(0);

  // const resolvedTheme = theme === "system" ? systemTheme : theme;
  const newTheme = resolvedTheme === "dark" ? "light" : "dark";
  const newThemeMatchesSystem = newTheme === systemTheme;

  function toggleTheme() {
    rotateWheel();
    setTheme(newThemeMatchesSystem ? "system" : newTheme);
  }

  function rotateWheel() {
    setIconsWheelRotationDegree((prevValue) => prevValue - 180);
  }

  return (
    <Button.Root className={styles.SwitchThemeButton} onClick={toggleTheme}>
      <Button.Content className={styles.SwitchThemeButtonContent}>
        <span
          className={styles.SwitchThemeButtonIconsWheel}
          style={{ transform: `rotate(${iconsWheelRotationDegree}deg)` }}
        >
          {resolvedTheme === "light" ? <SunIcon id="1" /> : <MoonIcon id="2" />}
          {resolvedTheme !== "light" ? <MoonIcon id="1" /> : <SunIcon id="2" />}
        </span>
      </Button.Content>
    </Button.Root>
  );
};
