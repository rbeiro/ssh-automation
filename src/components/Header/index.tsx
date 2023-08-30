"use client";

import { useSession } from "next-auth/react";
import { LoginButton } from "../LoginButton";
import { SwitchTheme } from "./components/SwitchTheme";
import styles from "./styles.module.scss";
import { SignOutButton } from "./components/SignOutButton";
import Link from "next/link";
import ActiveLink from "../ActiveLink";

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header className={styles["Container"]}>
      <div className={styles["Wrapper"]}>
        <nav className={styles["Navigation"]}>
          <ul>
            <ActiveLink
              href={"/provisionamento"}
              className={styles["NavigationLink"]}
              activeClassName={styles["NavigationActiveLink"]}
            >
              <li>Provisionamento</li>
            </ActiveLink>
          </ul>
        </nav>

        <div className={styles["Actions"]}>
          {session ? <SignOutButton /> : <LoginButton />}
          <SwitchTheme />
        </div>
      </div>
    </header>
  );
};
