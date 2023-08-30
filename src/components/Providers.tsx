"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactQueryStreamedHydration } from "@tanstack/react-query-next-experimental";
type ThemeProviderProps = Parameters<typeof NextThemesProvider>[0];

/**
 * Your app's theme provider component.
 * 'use client' is essential for next-themes to work with app-dir.
 */

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [client] = React.useState(new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <ReactQueryStreamedHydration>
        <ThemeProvider
          attribute="class"
          value={{ light: "light-theme", dark: "dark-theme" }}
          defaultTheme="dark"
        >
          {children}
        </ThemeProvider>
      </ReactQueryStreamedHydration>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </SessionProvider>
  );
}
