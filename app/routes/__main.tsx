import { Outlet } from "@remix-run/react";
import { ResponsiveAppBar } from "~/components/navbar";

export default function MainWrapper {
    return <>
        <ResponsiveAppBar />
        <Outlet />
    </>;
}