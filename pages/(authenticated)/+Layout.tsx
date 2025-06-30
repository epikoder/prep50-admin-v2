import React, { useEffect } from "react";
import { Link } from "@components/Link";
import { usePageContext } from "vike-react/usePageContext";
import Badge from "@components/Badge";
import Carbon from "@src/utils/carbon";
import Logo from "@components/Logo";

export default function LayoutDefault({
    children,
}: {
    children: React.ReactNode;
}) {
    const context = usePageContext();

    return (
        <div className="flex max-w-[2000px] mx-auto w-screen h-screen overflow-hidden">
            <Sidebar>
                <Logo />
                <Link href="/">Dashboard</Link>
                <Link href="/collections">Collection</Link>
                <Link href="/publish">Publish</Link>
                <Link href="/settings">Settings</Link>
            </Sidebar>
            <Content>{children}</Content>
        </div>
    );
}

function Sidebar({ children }: { children: React.ReactNode }) {
    return (
        <div
            id="sidebar"
            className="p-5 flex flex-col gap-2 flex-shrink-0"
            style={{
                lineHeight: "1.8em",
                borderRight: "2px solid #eee",
            }}
        >
            {children}
        </div>
    );
}

function Content({ children }: { children: React.ReactNode }) {
    return (
        <div id="page-container" className="w-full">
            <div id="page-content" className="h-screen overflow-hidden w-full">
                {children}
            </div>
        </div>
    );
}
