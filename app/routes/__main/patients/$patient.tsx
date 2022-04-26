import { Box, Button, ButtonGroup, Divider, Paper, Stack, Tab, Tabs, TextField } from "@mui/material";
import { Allergy, Patient } from "@prisma/client";
import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { Form, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { BasicBreadcrumbs } from "~/components/crumbs";
import { MainContainer, TabPanel } from "~/components/layout";
import { AllergySelector, GenderSelect } from "~/components/multiSelectors";
import { db } from "~/services/db.server";

interface LoaderData {
    patient: Patient & { allergies: Allergy[] },
    allergies: Allergy[]
}

export default function Patient() {
    const { patient, allergies } = useLoaderData<LoaderData>();

    const [openTab, setOpenTab] = useState(0);

    return <>
        <BasicBreadcrumbs items={[["Patients", "/patients"], `${patient.firstName} ${patient.lastName}`]} />
        <Paper>
            <MainContainer heading={`${patient.firstName} ${patient.lastName}`} subHeading={`Medical Patient, Registered ${new Date(patient.registered).toDateString()}`}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={openTab} onChange={(_, value) => setOpenTab(value)} aria-label="basic tabs example">
                        <Tab label="General Info" />
                        <Tab label="Allergies" />
                    </Tabs>
                </Box>
                <Form method="post">
                    <TabPanel value={openTab} index={0}>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2}>
                                <TextField name="firstName" label="First Name" variant="outlined" defaultValue={patient.firstName} />
                                <TextField name="lastName" label="Last Name" variant="outlined" defaultValue={patient.lastName} />
                                <TextField name="age" label="Age" variant="outlined" defaultValue={patient.age} type="number" />
                                <GenderSelect startingGender={patient.gender} />
                            </Stack>
                            <TextField name="notes" label="Notes" variant="filled" defaultValue={patient.notes} multiline minRows={10} fullWidth />
                        </Stack>
                    </TabPanel>
                    <TabPanel value={openTab} index={1}>
                        <AllergySelector name="allergies" allergies={allergies} defaultSelected={patient.allergies} />
                    </TabPanel>
                    <ButtonGroup variant="contained">
                        <Button type="submit">Save</Button>
                    </ButtonGroup>
                </Form>
            </MainContainer>

        </Paper>
    </>;
}

export const loader: LoaderFunction = async ({ params }) => {
    return {
        patient: await db.patient.findFirst({
            where: {
                id: params.patient
            },
            include: {
                allergies: true
            }
        }),
        allergies: await db.allergy.findMany()
    } as LoaderData
};

export const action: ActionFunction = async ({ request, params }) => {
    const formData = await request.formData();

    const firstName = formData.get("firstName") as string ?? undefined;
    const lastName = formData.get("lastName") as string ?? undefined;
    const age = formData.get("age") as string ?? undefined;
    const notes = formData.get("notes") as string ?? undefined;

    const allergies = formData.has("allergies") ? JSON.parse(formData.get("allergies") as string) as Allergy[] : undefined;

    await db.patient.update({
        data: {
            firstName,
            lastName,
            age: age ? Number(age) : undefined,
            notes,
            allergies: allergies ? {
                set: allergies.map(allergy => ({ id: allergy.id }))
            } : undefined
        },
        where: {
            id: params.patient
        }
    });

    return json({
        success: true,
        message: "Patient updated successfully."
    })

};