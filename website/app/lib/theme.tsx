import {
  StyledEngineProvider,
  ThemeProvider,
  createTheme,
} from "@mui/material/styles";
import { useFetcher, useRouteLoaderData } from "@remix-run/react";
import { ReactNode, createContext, useEffect, useMemo, useRef, useState } from "react";
import { loader as routeLoader } from "~/routes/_root";
import { createCookie } from "@remix-run/node";

export const userTheme = createCookie("theme", {});

export function isValidTheme(theme: any): theme is ("dark" | "light") {
  return typeof theme === "string" && (theme === "dark" || theme === "light");
}

type ThemeContextType = {
  switchColorMode: () => void;
};

type ThemeProviderProps = {
  children: ReactNode;
};

export const ThemeContext = createContext<ThemeContextType>({
  switchColorMode: () => {},
});

export function ThemeContextProvider({ children }: ThemeProviderProps) {
  const routeData = useRouteLoaderData<typeof routeLoader>("routes/_root");
  const [mode, setMode] = useState<"light" | "dark">(routeData?.theme ?? "light");

  const persistTheme = useFetcher();
  const switchColorMode = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  const mountRun = useRef(true);
  useEffect(() => {
    if (mountRun.current) {
      mountRun.current = false;
      return;
    }
    persistTheme.submit({ theme: mode }, { action: '/set-theme', method: 'post' });
  }, [mode]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <ThemeContext.Provider value={{ switchColorMode }}>
        <ThemeProvider theme={theme}>{children}</ThemeProvider>
      </ThemeContext.Provider>
    </StyledEngineProvider>
  );
}
