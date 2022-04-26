import { Patient, Allergy, Gender } from "@prisma/client";
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
import { Button, Fab } from "@mui/material";
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
import { AllergySelector, GenderSelect } from "~/components/multiSelectors";
import { BasicBreadcrumbs } from "~/components/crumbs";

interface LoaderData {
    patients: (Patient & {
        allergies: Allergy[]
    })[],
    allergies: Allergy[]
}

function NewDialog({ open, setOpen, allergies }: { open: boolean, setOpen: (open: boolean) => void, allergies: Allergy[] }) {
    return (
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>Register new patient</DialogTitle>
            <Form method="post">
                <DialogContent>
                    <DialogContentText>
                        Please provide details about the patient.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="firstName"
                        name="firstName"
                        label="First Name"
                        type="text"
                        variant="standard"
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="lastName"
                        name="lastName"
                        label="Last Name"
                        type="text"
                        variant="standard"
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        id="age"
                        name="age"
                        label="Age"
                        type="number"
                        variant="standard"
                    />
                    <InputLabel id="gender">Gender</InputLabel>
                    <GenderSelect startingGender="MALE" />
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

export default function Patients() {
    const { patients, allergies } = useLoaderData<LoaderData>();

    const [open, setOpen] = useState<boolean>(false);

    const rows = patients.map(patient => {
        return {
            id: patient.id,
            firstName: patient.firstName,
            lastName: patient.lastName,
            age: patient.age,
            allergies: patient.allergies.length > 0 ? patient.allergies.map(allergy => allergy.name).join(', ') : "None",
            gender: patient.gender,
            registered: patient.registered
        }
    });

    return (<>
        <BasicBreadcrumbs items={["Patients"]} />
        <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }} aria-label="patients">
                <TableHead>
                    <TableRow>
                        {/* <TableCell>ID</TableCell> */}
                        <TableCell>Link</TableCell>
                        <TableCell align="right">First Name</TableCell>
                        <TableCell align="right">Last Name</TableCell>
                        <TableCell align="right">Age</TableCell>
                        <TableCell align="right">Registered At</TableCell>
                        <TableCell align="right">Gender</TableCell>
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
                            <TableCell align="right">{row.firstName}</TableCell>
                            <TableCell align="right">{row.lastName}</TableCell>
                            <TableCell align="right">{row.age}</TableCell>
                            <TableCell align="right">{new Date(row.registered).toDateString()}</TableCell>
                            <TableCell align="right">{row.gender}</TableCell>
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

    const patients = await db.patient.findMany({
        include: {
            allergies: true
        }
    });

    const allergies = await db.allergy.findMany();

    return {
        patients,
        allergies
    } as LoaderData
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const age = formData.get('age') as string;
    const gender = formData.get("gender") as string;
    const rawAllergies = formData.get("allergies") as string;

    if (!firstName || !lastName || !age || !gender || !rawAllergies) {
        return json({
            success: false,
            error: "Please provide all the required fields."
        });
    }

    const allergies = JSON.parse(rawAllergies) as Allergy[]

    const patient = await db.patient.create({
        data: {
            firstName,
            lastName,
            age: Number(age),
            gender: gender as Gender,
            allergies: {
                connect: allergies.map(allergy => ({ id: allergy.id }))
            }
        }
    });

    return json({
        success: true,
        error: `${firstName} ${lastName} has been registered.`
    });
};