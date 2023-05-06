import Head from 'next/head';
import Link from 'next/link';
import Layout, { siteTitle } from '../components/layout';
import utilStyles from '../styles/utils.module.css';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { CourseCard } from '../components/card';
import { IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { createClient } from '@supabase/supabase-js';
import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function Home() {
  const [courses, setCourses] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('courses').select('*')
      if (error) console.log('error', error)
      else setCourses(data)
    }
    fetchData()
  }, [])

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
        <div className={utilStyles.divRow}>
          <h1>Courses</h1>
          <IconButton aria-label="New Course" color="success">
            <AddCircleOutlineIcon />
          </IconButton>
        </div>
        {courses != null ? courses.map((course, index) => (<Link key={index} href={{ pathname: "/course_page", query: { id: course.id } }}>
            <Box sx={{ minWidth: 275 }}>
              <Card variant="outlined"><CourseCard course={course}/></Card>
            </Box>
        </Link>
      )) : <p>Loading...</p>}
      </section>
    </Layout>
  );
}