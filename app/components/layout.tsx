import { Box, Container, Typography } from "@mui/material";
import React from "react";

export function MainContainer({ heading, subHeading, children }: { heading: string, subHeading: string, children: React.ReactNode }) {
    return <Container style={{ paddingTop: "1px", paddingBottom: "20px" }}>
        <div style={{ margin: "10px 0" }}>
            <Typography fontSize={"30px"} style={{ margin: "6px 0" }}>{heading}</Typography>
            <Typography fontSize={"15px"} color="text.primary">{subHeading}</Typography>
        </div>
        {children}
    </Container>
}

export function TabPanel(props: {
    children?: React.ReactNode,
    index: number,
    value: number
}) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}