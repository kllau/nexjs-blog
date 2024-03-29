import Head from "next/head";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { v4 as uuid4 } from "uuid";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import React, { useState, useEffect, useCallback } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { WordList } from "../components/wordlist";
import { Divider, IconButton } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import SendIcon from "@mui/icons-material/Send";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import HistoryEduIcon from "@mui/icons-material/HistoryEdu";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";
import Link from "next/link";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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

  const [courses, setCourses] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  const fetchData = useCallback(() => {
    const _fetch = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id);
      if (error) console.log("error", error);
      else setCourses(data);
    };
    _fetch();
  }, [id, setCourses]);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchData();
  }, [id]);

  // Entering new words to the course
  const [inputWords, setInputWords] = useState([
    { id: uuid4(), target_word: "", source_word: "" },
  ]);

  // Visibility of the first word input div
  const [visible, setVisible] = useState(false);
  function firstNewWord() {
    setVisible(true);
  }

  const handleAddWord = () => {
    !visible
      ? firstNewWord()
      : setInputWords([
          ...inputWords,
          { id: uuid4(), target_word: "", source_word: "" },
        ]);
  };

  const handleChangeInput = (id, event) => {
    const newInputWords = inputWords.map((i) => {
      if (id === i.id) {
        i[event.target.name] = event.target.value;
      }
      return i;
    });
    setInputWords(newInputWords);
  };

  //Refresh list without refreshing the whole page
  const refreshList = useCallback(() => {
    setRefreshCount(refreshCount + 1);
    setInputWords([]);
    setVisible(false);
  }, [refreshCount]);

  // Validate input is not empty
  const validateInput = () => {
    let hasError = false;
    const newInputWords = inputWords.map((inputWord) => {
      const source_word = inputWord.source_word.trim();
      const target_word = inputWord.target_word.trim();

      if (source_word.length === 0) {
        hasError = true;
        return { ...inputWord, hasErrorSourceWord: true };
      }
      if (target_word.length === 0) {
        hasError = true;
        return { ...inputWord, hasErrorTargetWord: true };
      }
      return inputWord;
    });
    setInputWords(newInputWords);
    return !hasError;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let valid = validateInput(inputWords);
    if (valid === false) {
      return;
    }

    const words_to_db = inputWords.map((w) => {
      return {
        source_word: w.source_word,
        target_word: w.target_word,
        course_id: id,
      };
    });

    const saveWords = async () => {
      const { error } = await supabase.from("words").insert(words_to_db);
      if (error) {
        throw error;
      }
    };

    saveWords()
      .then((res) => {
        console.log("Saved successfully!");
        refreshList();
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  return (
    <Layout children>
      {courses != null
        ? courses.map((course, index) => (
            <div key={index}>
              <Head>
                <title>{course.name}</title>
              </Head>
              <ThemeProvider theme={theme}>
                <Container>
                  <div className={utilStyles.divRow}>
                  <Link href="/"><IconButton><ArrowBackIcon fontSize="large" /></IconButton></Link>
                  <h1 key={index}>{course.name}</h1>
                  </div>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    {course.source_language} - {course.target_language}
                  </Typography>
                  <p>{course.description}</p>
                </Container>
                <Divider />
                <Container>
                  <div
                    className={`${utilStyles.divRow} ${utilStyles.marginTop}`}
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      flexGrow: 1,
                      marginRight: 15,
                    }}
                  >
                    <ButtonGroup>
                      <Link
                        href={{ pathname: "/study", query: { id: course.id } }}
                      >
                        <Button
                          variant="outlined"
                          color="primary"
                          startIcon={<LibraryBooksIcon />}
                          sx={{ mr: 0.5 }}
                        >
                          Study
                        </Button>
                      </Link>
                      <Link
                        href={{ pathname: "/practice", query: { id: course.id } }}
                      >
                        <Button
                          variant="contained"
                          startIcon={<HistoryEduIcon />}
                        >
                          Practice
                        </Button>
                      </Link>
                    </ButtonGroup>
                  </div>
                </Container>
                <Container>
                  <div className={utilStyles.divRow}>
                    <h2>Word list</h2>
                    <IconButton
                      aria-label="New Word"
                      color="success"
                      onClick={handleAddWord}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </div>
                </Container>
                <Container
                  className={utilStyles.marginBottom}
                  style={{ display: visible ? "block" : "none" }}
                >
                  <form>
                    {inputWords.map((inputWord) => (
                      <div
                        key={inputWord.id}
                        className={utilStyles.marginBottom}
                      >
                        <TextField
                          error={inputWord.hasErrorSourceWord}
                          helperText={
                            inputWord.hasErrorSourceWord
                              ? "Enter source word"
                              : ""
                          }
                          sx={{ mr: 1 }}
                          autoComplete="off"
                          variant="standard"
                          color="grey"
                          name="source_word"
                          label="Source Word"
                          value={inputWords.source_word}
                          onChange={(event) =>
                            handleChangeInput(inputWord.id, event)
                          }
                        />
                        <TextField
                          error={inputWord.hasErrorTargetWord}
                          helperText={
                            inputWord.hasErrorTargetWord
                              ? "Enter target word"
                              : ""
                          }
                          autoComplete="off"
                          variant="standard"
                          color="grey"
                          name="target_word"
                          label="Target Word"
                          value={inputWords.target_word}
                          onChange={(event) =>
                            handleChangeInput(inputWord.id, event)
                          }
                        />
                      </div>
                    ))}
                    <Button
                      className={utilStyles.saveButton}
                      endIcon={<SendIcon />}
                      variant="contained"
                      color="success"
                      type="submit"
                      onClick={handleSubmit}
                    >
                      Save
                    </Button>
                  </form>
                </Container>
                <Container>
                  <WordList
                    id={course.id}
                    refreshCount={refreshCount}
                    refreshList={refreshList}
                  />
                </Container>
              </ThemeProvider>
            </div>
          ))
        : "still loading"}
    </Layout>
  );
}
