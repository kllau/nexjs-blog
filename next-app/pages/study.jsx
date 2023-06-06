import Head from "next/head";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { ThemeProvider } from "@emotion/react";
import { createClient } from "@supabase/supabase-js";

const theme = createTheme({
  palette: {
    primary: {
      light: "#d1c4e9",
      main: "#4527a0",
      dark: "#311b92",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
    success: {
      light: "#80cbc4",
      main: "#00695c",
      dark: "#004d40",
      contrastText: "#e0f2f1",
    },
  },
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);