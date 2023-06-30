import Head from "next/head";
import { useState, useCallback, useEffect, useRef } from "react";
import Layout from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import { createTheme } from "@mui/material/styles";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { ThemeProvider } from "@emotion/react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/router";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Link from "next/link";
import TextField from "@mui/material/TextField";

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
};

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
const SUCCESS_TRIES = 3;

export default function (props) {
  const router = useRouter();
  const { id } = router.query;

  // Get the ids of the already studied words
  const [all_words, setAllWords] = useState(null);
  const [studied_words, setStudiedWords] = useState(null);
  const [end_of_study, setEndOfStudy] = useState(false);

  // Visibility of the correctness
  const [visible, setVisible] = useState(false);
  const [CorrectIncorrect, setCorrectIncorrect] = useState("");

  // Check the provided answer, if correct answer was provided 3 times, mark word as studied
  const [user_given_answers, setUserGivenAnswers] = useState([]);
  const [currentWordIndex, setCounter] = useState(0);
  const [user_answer, setUserAnswer] = useState("");
  const [words_to_study, setWordsToStudy] = useState(null);
  const [next_word_clicked, setNextWordClicked] = useState(false);
  const [wordPendingSave, setWordPendingSave] = useState(false);

  // Get all course words from DB
  const fetchCourseWordsData = useCallback(() => {
    const _fetch = async () => {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("course_id", id);
      if (error) console.log("error", error);
      else setAllWords(data);
    };
    _fetch();
  }, [id, setAllWords]);

  // Get studided words from DB
  const fetchStudiedWordsData = useCallback(() => {
    const _fetch = async () => {
      const { data, error } = await supabase
        .from("studied_words")
        .select("word_id")
        .eq("course_id", id);
      if (error) console.log("error", error);
      else setStudiedWords(data.map((e) => e.word_id));
    };
    _fetch();
  }, [id, setStudiedWords]);

  useEffect(() => {
    if (!id) {
      return;
    }
    fetchCourseWordsData();
    fetchStudiedWordsData();
  }, [id]);

  useEffect(() => {
    if (!all_words || !studied_words) return;

    // Filter studied words from course words
    let words_to_study = all_words
      .map((w) => w.id)
      .filter((w_id) => !studied_words.includes(w_id));

    // Shuffle words and set as pending to study
    if (words_to_study) shuffleArray(words_to_study);
    setWordsToStudy(words_to_study);
    if (words_to_study && words_to_study.length === 0) setEndOfStudy(true);
  }, [all_words, studied_words]);

  const handleInputChange = (event) => {
    const entered_answer = event.target.value;
    setUserAnswer(entered_answer);
  };

  // Function to update property in user_given_answers (no of tries, success or fails)
  const updateWordProperty = (id, property) => {
    setUserGivenAnswers((prevArray) => {
      let newArray = [...prevArray];
      let objectIndex = prevArray.findIndex((obj) => obj.id === id);
      if (objectIndex === -1) {
        const newObject = { id };
        newArray = [...prevArray, newObject];
        objectIndex = newArray.length - 1;
      }
      const updatedObject = { ...newArray[objectIndex] };
      updatedObject[property] ||= 0;
      updatedObject[property] += 1;
      newArray[objectIndex] = updatedObject;
      return newArray;
    });
  };

  // Save studied word in db
  const saveStudiedWord = async (word) => {
    const { error } = await supabase.from("studied_words").insert(word);
    if (error) {
      throw error;
    }
  };

  const handleCheckWord = () => {
    if (!all_words || !words_to_study) return;
    let answerCorrect =
      user_answer ===
      all_words.find((word) => word.id === words_to_study[currentWordIndex]).source_word;

    setVisible(true);
    updateWordProperty(words_to_study[currentWordIndex], "tries");
    setCorrectIncorrect(answerCorrect ? "Correct!" : "Incorrect!");
    updateWordProperty(
      words_to_study[currentWordIndex],
      answerCorrect ? "success" : "fails"
    );
    setWordPendingSave(true);
  };

  // Check how many times the word was previously answered correctly, if 3, mark it as studied and remove from words_to_study
  useEffect(() => {
    if (!wordPendingSave) return;
    setWordPendingSave(false);
    
    if (user_given_answers.find((w) => w.id === words_to_study[currentWordIndex])?.success || 0 < SUCCESS_TRIES) {
      return;
    }

    // Update the studied_words table
    const word_studied = {
      course_id: id,
      word_id: words_to_study[currentWordIndex],
    };
    saveStudiedWord(word_studied)
      .then((res) => {})
      .catch((err) => {
        console.error(err);
      });
  }, [user_given_answers, currentWordIndex, wordPendingSave]);

  // Check if the study cycle has ended by checking if there are any words_to_study remaining
  const refreshCard = useCallback(() => {
    if (words_to_study && words_to_study.length === 0) {
      // State end of study and possibility to refresh
      setEndOfStudy(true);
      setVisible(false);
    } else if (
      words_to_study &&
      words_to_study.length !== 0 &&
      currentWordIndex === words_to_study.length - 1
    ) {
      setCounter(0);
      setVisible(false);
    } else {
      setCounter(currentWordIndex + 1);
      setVisible(false);
    }
  }, [words_to_study, currentWordIndex]);

  const handleNextWord = () => {
    setUserAnswer("");
    // Remove already learnt word from words_to_study array to not study it again
    if (user_given_answers.find((w) => w.id === words_to_study[currentWordIndex])?.success || 0 >= SUCCESS_TRIES) {
      const adjusted_words_to_study = words_to_study.filter(
        (word) => word != words_to_study[currentWordIndex]
      );
      setWordsToStudy(adjusted_words_to_study);
      setCounter(currentWordIndex - 1);
    }

    setNextWordClicked(true);
  };

  useEffect(() => {
    if (!next_word_clicked) {
      return;
    } else {
      setNextWordClicked(false);
      refreshCard();
    }
  }, [next_word_clicked]);

  // When practice is reset, remove all course words' ids from the studied_words table
  const handleResetPractice = useCallback(() => {
    const _fetch = async () => {
      const { data, error } = await supabase
        .from("studied_words")
        .delete("*")
        .eq("course_id", id);
      if (error) console.log("error", error);
      else router.reload();
    };
    _fetch();
  }, [id]);

  // Detect key pressed to submit the word and continue to the next one
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === " ") {
        handleNextWord();
      } else if (event.key === "Enter") {
        event.preventDefault();
        handleCheckWord();
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
        <title>Pracitce words</title>
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
              <Paper variant="outlined">
                <form>
                  <Container sx={{ maxWidth: 345, minWidth: 300 }}>
                    <Container>
                      {words_to_study != null &&
                      end_of_study === false &&
                      !next_word_clicked ? (
                        <Container>
                          <Container>
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="div"
                              align="center"
                              className={utilStyles.marginTop}
                            >
                              {
                                all_words.find(
                                  (word) => word.id === words_to_study[currentWordIndex]
                                ).target_word
                              }
                            </Typography>
                          </Container>
                          <Container>
                            <TextField
                              id="standard-basic"
                              variant="standard"
                              autoFocus
                              className={utilStyles.marginBottom}
                              align="center"
                              autoComplete="off"
                              inputProps={{ style: { textAlign: "center" } }}
                              name="word_answer"
                              value={user_answer}
                              onChange={handleInputChange}
                            />
                          </Container>
                          <Container
                            align="center"
                            style={{ display: !visible ? "block" : "none" }}
                          >
                            <Button onClick={handleCheckWord}>Check</Button>
                          </Container>
                          <Container
                            className={utilStyles.marginBottom}
                            style={{ display: visible ? "block" : "none" }}
                          >
                            <Typography
                              gutterBottom
                              variant="h5"
                              component="div"
                              align="center"
                            >
                              {CorrectIncorrect}
                            </Typography>
                          </Container>
                          <Box align="center">
                            <Button
                              className={utilStyles.marginTop}
                              onClick={handleNextWord}
                              align="center"
                            >
                              Next word
                            </Button>
                          </Box>
                        </Container>
                      ) : end_of_study === true ? (
                        <Container>
                          <Typography
                            gutterBottom
                            variant="h5"
                            component="div"
                            align="center"
                            className={utilStyles.marginTop}
                          >
                            Practice has been completed!
                          </Typography>
                          <Box align="center">
                            <Button
                              className={utilStyles.marginTop}
                              onClick={handleResetPractice}
                              align="center"
                            >
                              Practice words again
                            </Button>
                          </Box>
                        </Container>
                      ) : (
                        <Container>Loading...</Container>
                      )}
                    </Container>
                  </Container>
                </form>
              </Paper>
            </Container>
          </Grid>
        </Grid>
        <Link href={{ pathname: "/course_page", query: { id: id } }}>
          Back to course page
        </Link>
      </ThemeProvider>
    </Layout>
  );
}
