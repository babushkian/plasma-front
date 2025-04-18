import { Link } from "react-router-dom";
import { Link as MuiLink } from "@mui/material";
import { GridRenderCellParams } from "@mui/x-data-grid";
import React from "react";

export function ProgramLink(params: GridRenderCellParams, endpoint: string):React.ReactNode {
    return (
        <MuiLink component={Link} to={`${endpoint}/${params.row.id}?ProgramName=${params.row.ProgramName}`}>
            {params.row.ProgramName}
        </MuiLink>
    );
}
