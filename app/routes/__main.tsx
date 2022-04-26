import { Outlet } from "@remix-run/react";
import { ResponsiveAppBar } from "~/components/navbar";
import styles from "~/styles/global.css";

export function links() {
    return [{ rel: "stylesheet", href: styles }];
}

export default function MainWrapper() {
    return <>
        <ResponsiveAppBar />
        <Outlet />
    </>;
}