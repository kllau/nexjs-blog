import Link from "next/link";
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
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import SendIcon from "@mui/icons-material/Send";

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

  const [inputWords, setInputWords] = useState([
    { id: uuid4(), target_word: "", source_word: "" },
  ]);

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

  const refreshList = useCallback(() => {
    setRefreshCount(refreshCount + 1);
    setInputWords([]);
    setVisible(false);
  }, [refreshCount]);

  const [formErrorSourceword, setFormErrorSourceword] = useState(false);
  const [formErrorTargetword, setFormErrorTargetword] = useState(false);
  const handleSubmit = (e) => {
    e.preventDefault();
    const words_to_db = inputWords.map((w) => {
      if (w.source_word.length === 0) {
        setFormErrorSourceword();
        return;
      }
      else if (w.target_word.length === 0) {
        setFormErrorTargetword();
        return;
      }
      else return {
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
              <Container>
                <h1 key={index}>{course.name}</h1>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {course.source_language} - {course.target_language}
                </Typography>
                <p>{course.description}</p>
              </Container>
              <Divider />
              <Container>
                <div className={utilStyles.divRow}>
                  <h2>Word list</h2>
                  <IconButton
                    aria-label="New Course"
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
                    <div key={inputWord.id} className={utilStyles.marginBottom}>
                      <TextField
                        error={formErrorSourceword}
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
                        error={formErrorTargetword}
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
            </div>
          ))
        : "still loading"}
    </Layout>
  );
}
