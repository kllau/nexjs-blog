import {
  DataGrid,
  GridColDef,
  GridValueGetterParams,
  GridToolbar,
  GridEventListener,
  GridSelectionModel,
  GridCellParams,
  GridApi,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarExport,
  GridToolbarDensitySelector,
} from "@mui/x-data-grid";
import { IconButton } from "@mui/material";
import DeleteOutlineSharpIcon from '@mui/icons-material/DeleteOutlineSharp';
import { createClient } from "@supabase/supabase-js";
import React, { useState, useEffect, useCallback } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const columns = [
  { field: "source_word", headerName: "Source word", width: 200 },
  { field: "target_word", headerName: "Target word", width: 200 },
];

export function WordList(props) {
  const [wordsToRemove, setWordsToRemove] = React.useState([]);

  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1, marginRight: 15 }}>
          <IconButton
            aria-label="Delete Words"
            color="primary"
            onClick={handleDeleteWords}
          >
            <DeleteOutlineSharpIcon />
          </IconButton>
        </div>
      </GridToolbarContainer>
    );
  }

  const { id, refreshCount, refreshList } = props;
  const [words, setWords] = useState(null);
  useEffect(() => {
    if (!id) {
      return;
    }
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("words")
        .select("*")
        .eq("course_id", id);
      if (error) console.log("error", error);
      else setWords(data);
    };
    fetchData();
  }, [id, refreshCount, setWords]);

  // Delete selected rows
  const removeWordsFromDb = async (word_ids) => {
    const {data,  error } = await supabase.from("words").delete().in('id', word_ids);
    if (error) {
      throw error;
    }
  };

  const handleDeleteWords = useCallback(async () => {
    
    await removeWordsFromDb(wordsToRemove);
    refreshList()
    console.log("Removed successfully!");
  }, [refreshList, wordsToRemove])

  if (!words) {
    return <p>Loading...</p>;
  } else {
    const rows = words;
    return (
      <>
        <div style={{ height: 800, width: "100%" }}> 
          <DataGrid
            rows={rows}
            columns={columns}
            pageSize={5}
            rowsPerPageOptions={[50]}
            slots={{ toolbar: CustomToolbar }}
            getRowId={(row) => row.id}
            checkboxSelection
            onRowSelectionModelChange={(ids) => {
              setWordsToRemove(ids)
            }}
          />
        </div>
      </>
    );
  }
}
