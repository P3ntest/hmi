import { Patient, Allergy, Gender, Ingredient } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import { db } from "~/services/db.server";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Autocomplete, Button, Fab } from "@mui/material";
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import AddIcon from '@mui/icons-material/Add';
import { useState } from "react";
import { AllergySelector } from "~/components/multiSelectors";
import { BasicBreadcrumbs } from "~/components/crumbs";

interface LoaderData {
    ingredients: (Ingredient & { allergies: Allergy[] })[],
    allergies: Allergy[]
}

function NewDialog({ open, setOpen, allergies }: { open: boolean, setOpen: (open: boolean) => void, allergies: Allergy[] }) {


    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Create a new ingredient</DialogTitle>
            <Form method="post">
                <DialogContent>
                    <DialogContentText>
                        Please provide details about the ingredient.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        name="name"
                        label="Name"
                        type="text"
                        variant="standard"
                    />
                    <AllergySelector name="allergies" allergies={allergies} defaultSelected={[]} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={() => setOpen(false)}>Create</Button>
                </DialogActions>
            </Form>
        </Dialog>
    );
}

export default function Ingredients() {
    const { ingredients, allergies } = useLoaderData<LoaderData>();

    const [open, setOpen] = useState<boolean>(false);

    const rows = ingredients.map(ingredient => {
        return {
            id: ingredient.id,
            name: ingredient.name,
            allergies: ingredient.allergies.length > 0 ? ingredient.allergies.map(allergy => allergy.name).join(", ") : "None"
        }
    });

    return (<>
        <BasicBreadcrumbs items={["Ingredients"]} />
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="patients">
                <TableHead>
                    <TableRow>
                        {/* <TableCell>ID</TableCell> */}
                        <TableCell>Link</TableCell>
                        <TableCell align="right">Name</TableCell>
                        <TableCell align="right">Allergies</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            {/* <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell> */}
                            <TableCell component="th" scope="row">
                                <Link to={row.id}>
                                    <Button>View Page</Button>
                                </Link>
                            </TableCell>
                            <TableCell align="right">{row.name}</TableCell>
                            <TableCell align="right">{row.allergies}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <Fab color="primary" aria-label="add" style={{ position: "fixed", bottom: "10px", right: "10px" }} onClick={() => setOpen(true)}>
            <AddIcon />
        </Fab>

        <NewDialog open={open} setOpen={setOpen} allergies={allergies} />
    </>);
}

export const loader: LoaderFunction = async () => {

    const ingredients = await db.ingredient.findMany({
        include: {
            allergies: true
        }
    });
    const allergies = await db.allergy.findMany();

    return {
        ingredients,
        allergies
    } as LoaderData
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const rawAllergies = formData.get('allergies') as string;

    if (!name) {
        return json({
            success: false,
            error: "Please provide all the required fields."
        });
    }

    const allergies = JSON.parse(rawAllergies) as Allergy[];

    const ingredient = await db.ingredient.create({
        data: {
            name,
            allergies: {
                connect: allergies.map(allergy => ({ id: allergy.id }))
            }
        }
    });

    return json({
        success: true,
        error: `${name} has been created.`
    });
};