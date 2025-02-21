import { Height } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import TrainOutlinedIcon from "@mui/icons-material/TrainOutlined";
import SystemSecurityUpdateOutlinedIcon from "@mui/icons-material/SystemSecurityUpdateOutlined";
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";

const rows: GridRowsProp = [
    { id: 1, col1: "Hello", col2: "World" },
    { id: 2, col1: "DataGridPro", col2: "is Awesome" },
    { id: 3, col1: "MUI", col2: "is Amazing" },
];

const columns: GridColDef[] = [
    { field: "col1", headerName: "Column 1", width: 150 },
    { field: "col2", headerName: "Column 2", width: 150 },
];

const TestLayout = () => {
    return (
        <Box sx={{ height: "90vh", dispay: "flex"}}>
            <Typography variant="h3" align="center" gutterBottom>
                привет
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={1} direction="column" columns={24}>
                    <Grid container>
                        <Grid size={8}>
                            <Paper>size=8</Paper>
                        </Grid>
                        <Grid size={4}>
                            <Paper>size=4</Paper>
                        </Grid>
                    </Grid>
                    <Grid container>
                        <Grid size={4}>
                            <Paper>size=4</Paper>
                        </Grid>
                        <Grid size={4}>
                            <Paper>size=4</Paper>
                        </Grid>
                        <Grid size={4}>
                            <Paper>size=4</Paper>
                        </Grid>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ height: "25vh" }}>
                <Grid container spacing={1}>
                    <Grid size={7} sx={{borderRight:"1px solid lightgray"}}>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <TrainOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Один" secondary="давдцать два петрович" />
                            </ListItem>
                            <ListItem>
                            <ListItemIcon><TaskAltOutlinedIcon /></ListItemIcon>
                                <ListItemText primary="Два" secondary="Охлим ролим передохлим" />
                                
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <SystemSecurityUpdateOutlinedIcon />
                                </ListItemIcon>
                                <ListItemText primary="Три" secondary="полубабичесвкая жизнь" />
                            </ListItem>
                        </List>
                    </Grid>

                    <Grid size={5}>
                        {" "}
                        <Button variant="contained">Всех уволить!</Button>
                        <Button variant="contained" color="success" size="small">
                            Всех уволить!
                        </Button>
                    </Grid>
                </Grid>
            </Box>
            <div style={{ height: 300, width: "100%" }}>
                <DataGrid rows={rows} columns={columns} />
            </div>
        </Box>
    );
};

export default TestLayout;
