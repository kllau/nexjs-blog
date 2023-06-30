import Head from "next/head";
import { useState, useCallback, useEffect } from "react";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { createTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@emotion/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Link from "next/link";

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

export default function (props) {
  const router = useRouter();
  const { id } = router.query;

  const [words, setWords] = useState(null);

  const fetchData = useCallback(() => {
    const _fetch = async () => {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("course_id", id);
      if (error) console.log("error", error);
      else setWords(data);
    };
    _fetch();
  }, [id, setWords]);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchData();
  }, [id]);

  const [counter, setCounter] = useState(0);

  const handleCardClick = (e) => {
    if (words.length != 0) {
      setVisible(true);}
  };

  // Visibility of the source word
  const [visible, setVisible] = useState(false);

  //Refresh card without refreshing the whole page
  const refreshCard = useCallback(() => {
    if (words != null && counter === words.length - 1) {
      setCounter(0);
      setVisible(false);
    } else {
      setCounter(counter + 1);
      setVisible(false);
    }
  }, [counter, words]);

  const handleNextWord = (e) => {
    refreshCard();
  };

  // Detect key pressed to see the word and continue to the next one
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === " ") {
        handleCardClick();
      } else if (event.key === "Enter") {
        handleNextWord();
      }
    };
    // Event listener
    window.addEventListener("keydown", handleKeyPress);

    // Clean up the event listener
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  return (
    <Layout children>
      <Head>
        <title>Study words</title>
      </Head>
      <ThemeProvider theme={theme}>
        <Grid
          container
          spacing={0}
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{ minHeight: "50vh" }}
        >
          <Grid item xs={3}>
            <Container>
              <Paper variant="outlined" className={utilStyles.cardColor}>
                <Card sx={{ maxWidth: 345, minWidth: 300 }}>
                  <CardActionArea>
                    <CardContent onClick={handleCardClick}>
                      {words != null && words.length !== 0 ? (
                        <Container>
                          <Typography
                            gutterBottom
                            variant="h4"
                            component="div"
                            align="center"
                            className={utilStyles.marginTop}
                          >
                            {words[counter].target_word}
                          </Typography>
                          <Container
                            style={{ display: !visible ? "block" : "none" }}
                          >
                            <Typography
                              sx={{ mb: 1.5 }}
                              color="text.secondary"
                              align="center"
                            >
                              Clik to check
                            </Typography>
                          </Container>
                        </Container>
                      ) : words != null && words.length == 0 ? (
                        <Typography
                          gutterBottom
                          variant="h4"
                          component="div"
                          align="center"
                          className={utilStyles.marginTop}
                        >
                          No words to study! Go to course page to add new words.
                        </Typography>
                      ) : (
                        <div>Loading...</div>
                      )}

                      <Container
                        style={{ display: visible ? "block" : "none" }}
                      >
                        <hr></hr>
                      </Container>
                      <Container
                        className={utilStyles.marginBottom}
                        style={{ display: visible ? "block" : "none" }}
                      >
                        {words != null && words.length != 0 ? (
                          <Typography
                            gutterBottom
                            variant="h4"
                            component="div"
                            align="center"
                          >
                            {" "}
                            {words[counter].source_word}{" "}
                          </Typography>
                        ) : (
                          <div>Loading...</div>
                        )}
                      </Container>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Paper>
            </Container>
          </Grid>
          <Button className={utilStyles.marginTop} onClick={handleNextWord}>
            Next word
          </Button>
        </Grid>
        <Link href={{ pathname: "/course_page", query: { id: id } }}>
          Back to course page
        </Link>
      </ThemeProvider>
    </Layout>
  );
}
