import { Patient, Allergy, Gender, Ingredient, Food } from "@prisma/client";
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
import { AllergySelector, IngredientSelector } from "~/components/multiSelectors";
import { BasicBreadcrumbs } from "~/components/crumbs";

interface LoaderData {
    food: (Food & { ingredients: Ingredient[] })[],
    ingredients: Ingredient[]
}

function NewDialog({ open, setOpen, ingredients }: { open: boolean, setOpen: (open: boolean) => void, ingredients: Ingredient[] }) {
    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Create a new food</DialogTitle>
            <Form method="post">
                <DialogContent>
                    <DialogContentText>
                        Please provide details about the food.
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
                    <IngredientSelector name="ingredients" ingredients={ingredients} defaultSelected={[]} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button type="submit" onClick={() => setOpen(false)}>Create</Button>
                </DialogActions>
            </Form>
        </Dialog>
    );
}

export default function Foods() {
    const { ingredients, food } = useLoaderData<LoaderData>();

    const [open, setOpen] = useState<boolean>(false);

    const rows = food.map(recipe => {
        return {
            id: recipe.id,
            name: recipe.name,
            ingredients: recipe.ingredients.length > 0 ? recipe.ingredients.map(ingredient => ingredient.name).join(", ") : "None"
        }
    });

    return (<>
        <BasicBreadcrumbs items={["Food"]} />
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="patients">
                <TableHead>
                    <TableRow>
                        {/* <TableCell>ID</TableCell> */}
                        <TableCell>Link</TableCell>
                        <TableCell align="right">Name</TableCell>
                        <TableCell align="right">Ingredients</TableCell>
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
                            <TableCell align="right">{row.ingredients}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
        <Fab color="primary" aria-label="add" style={{ position: "fixed", bottom: "10px", right: "10px" }} onClick={() => setOpen(true)}>
            <AddIcon />
        </Fab>

        <NewDialog open={open} setOpen={setOpen} ingredients={ingredients} />
    </>);
}

export const loader: LoaderFunction = async () => {

    const food = await db.food.findMany({
        include: {
            ingredients: true
        }
    });
    const ingredients = await db.ingredient.findMany();

    return {
        ingredients,
        food
    } as LoaderData
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const rawIngredients = formData.get('ingredients') as string;

    if (!name) {
        return json({
            success: false,
            error: "Please provide all the required fields."
        });
    }

    const ingredients = JSON.parse(rawIngredients) as Allergy[];

    const food = await db.food.create({
        data: {
            name,
            ingredients: {
                connect: ingredients.map(ingredient => ({ id: ingredient.id }))
            }
        }
    });

    return json({
        success: true,
        error: `${name} has been created.`
    });
};