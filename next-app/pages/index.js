import Head from "next/head";
import Link from "next/link";
import Layout, { siteTitle } from "../components/layout";
import utilStyles from "../styles/utils.module.css";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import { CourseCard } from "../components/card";
import { IconButton, TextField } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { createClient } from "@supabase/supabase-js";
import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { createTheme } from "@mui/material/styles";
import { ThemeProvider } from "@emotion/react";
import { v4 as uuid4 } from "uuid";
import Container from "@mui/material/Container";
import { useRouter } from "next/router";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
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

  const router = useRouter();

  const [courses, setCourses] = useState(null);

  // Fetch data from supabase to display courses
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from("courses").select("*");
      if (error) console.log("error", error);
      else setCourses(data);
    };
    fetchData();
  }, []);

  // Dialog window for adding new course
  const [formInputs, setFormInputs] = useState({
    name: "",
    source_language: "",
    target_language: "",
    description: "",
  });
  const [open_dialog, setOpenDialog] = useState(false);

  const handleClickOpen = () => {
    setOpenDialog(true);
  };
  const handleClickClose = () => {
    setFormInputs({
      name: "",
      source_language: "",
      target_language: "",
      description: "",
    });
    setOpenDialog(false);
  };

  // Entering new course data
  const handleChangeInput = (event) => {
    const { name, value } = event.target;
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      [name]: value,
    }));
  };
  // Validate input is not empty
  const [validInput, setValidInput] = useState(true);
  const validateInput = () => {
    let hasError = false;
    const formErrorElements = {};

    const course_name = formInputs.name.trim();
    const source_language = formInputs.source_language.trim();
    const target_language = formInputs.target_language.trim();

    if (course_name.length === 0) {
      hasError = true;
      formErrorElements.hasErrorName = true;
    }
    if (source_language.length === 0) {
      hasError = true;
      formErrorElements.hasErrorSourceLanguage = true;
    }
    if (target_language.length === 0) {
      hasError = true;
      formErrorElements.hasErrorTargetLanguage = true;
    }
    setFormInputs((prevInputs) => ({
      ...prevInputs,
      formErrorElements,
    }));

    return !hasError;
  };

  // Save the new course to the db
  const handleSaveCourse = (e) => {
    e.preventDefault();
    let valid = validateInput(formInputs);
    if (valid === false) {
      setValidInput(false);
      return;
    }

    const course_data =  {
      name: formInputs.name,
      source_language: formInputs.source_language,
      target_language: formInputs.target_language,
      description: formInputs.description,
    };

    const saveCourse = async () => {
      console.log(course_data);
      const { error } = await supabase.from("courses").insert(course_data);
      if (error) {
        throw error;
      }
    };

    saveCourse()
      .then((res) => {
        console.log("Saved successfully!");
        router.reload();
      })
      .catch((error) => {
        console.log("Error:", error);
      });
  };

  return (
    <Layout home>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Learn languages with lightspeed!</p>
      </section>
      <section>
        <hr></hr>
        <ThemeProvider theme={theme}>
          <div className={utilStyles.divRow}>
            <h1>Courses</h1>
            <IconButton
              aria-label="New Course"
              color="success"
              onClick={handleClickOpen}
            >
              <AddCircleOutlineIcon />
            </IconButton>
            <Dialog open={open_dialog} onClose={handleClickClose}>
              <DialogTitle>Add new course</DialogTitle>
              <DialogContent>
                <div
                  className={`${utilStyles.divRow} ${utilStyles.marginTop}`}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexGrow: 1,
                    marginRight: 15,
                  }}
                >
                  <Typography>Course name:</Typography>
                  <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    name="name"
                    type="text"
                    variant="standard"
                    sx={{ ml: 0.5 }}
                    autoComplete="off"
                    inputProps={{ style: { textAlign: "center" } }}
                    value={formInputs.name}
                    onChange={handleChangeInput}
                    placeholder="Spanish for beginners"
                  />
                </div>
                <div
                  className={`${utilStyles.divRow} ${utilStyles.marginTop}`}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexGrow: 1,
                    marginRight: 15,
                  }}
                >
                  <Typography>Language pair:</Typography>
                  <TextField
                    margin="dense"
                    id="source_language"
                    name="source_language"
                    type="text"
                    variant="standard"
                    sx={{ ml: 0.5 }}
                    autoComplete="off"
                    inputProps={{ style: { textAlign: "center" } }}
                    style={{ maxWidth: 100 }}
                    value={formInputs.source_language}
                    onChange={handleChangeInput}
                    placeholder="English"
                  />
                  <Typography>—</Typography>
                  <TextField
                    margin="dense"
                    id="target_language"
                    name="target_language"
                    type="text"
                    variant="standard"
                    sx={{ ml: 0.5 }}
                    autoComplete="off"
                    inputProps={{ style: { textAlign: "center" } }}
                    style={{ maxWidth: 100 }}
                    value={formInputs.target_language}
                    onChange={handleChangeInput}
                    placeholder="Spanish"
                  />
                </div>

                <div
                  className={`${utilStyles.divRow} ${utilStyles.marginTop}`}
                  style={{
                    display: "flex",
                    justifyContent: "flex-start",
                    flexGrow: 1,
                    marginRight: 15,
                  }}
                ></div>
                <Typography>Course description:</Typography>
                <TextField
                  margin="dense"
                  id="description"
                  name="description"
                  type="text"
                  variant="standard"
                  multiline
                  fullWidth
                  maxRows={4}
                  sx={{ ml: 0.5 }}
                  autoComplete="off"
                  inputProps={{ style: { textAlign: "center" } }}
                  value={formInputs.description}
                  onChange={handleChangeInput}
                />
                <Container style={{ display: !validInput ? "block" : "none" }}>
                  <Typography>
                    Please provide course name and language pair!
                  </Typography>
                </Container>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClickClose}>Cancel</Button>
                <Button onClick={handleSaveCourse}>Save</Button>
              </DialogActions>
            </Dialog>
          </div>
          {courses != null ? (
            courses.map((course, index) => (
              <Link
                key={index}
                href={{ pathname: "/course_page", query: { id: course.id } }}
              >
                <Box sx={{ minWidth: 275, mb: 0.5 }}>
                  <Card variant="outlined">
                    <CourseCard course={course} />
                  </Card>
                </Box>
              </Link>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </ThemeProvider>
      </section>
    </Layout>
  );
}
