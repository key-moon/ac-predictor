import { Brightness4, Brightness7 } from "@mui/icons-material";
import { AppBar, Box, IconButton, Toolbar, Typography, useTheme } from "@mui/material";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { useContext } from "react";
import { ThemeContext, isValidTheme, userTheme } from "~/lib/theme";

async function getTheme(request: Request) {
  const cookieTheme = await userTheme.parse(request.headers.get("Cookie"));
  console.log(cookieTheme);
  if (isValidTheme(cookieTheme)) return cookieTheme;
  
  if (request.headers.has("Sec-CH-Prefers-Color-Scheme")) {
    const prefTheme = request.headers.get("Sec-CH-Prefers-Color-Scheme");
    if (isValidTheme(prefTheme)) return prefTheme;
  }

  return "light";
}

export async function loader({ request }: LoaderFunctionArgs) {
  return { theme: await getTheme(request) };
}

export default function Index() {
  const t = useTheme();
  const theme = useContext(ThemeContext);

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>ac-predictor</Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
              color: 'text.primary',
              borderRadius: 10,
              p: 0.3,
            }}
          > 
            <IconButton onClick={theme.switchColorMode} color="inherit">
              {t.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Box>
          <Typography variant="subtitle1" sx={{ color: 'green', px: 1 }}>state: ✔ running</Typography>
        </Toolbar>
      </AppBar>
      <Outlet/>
    </>
  );
}
