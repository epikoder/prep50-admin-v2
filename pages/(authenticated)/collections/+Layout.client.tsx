import React, { Fragment, useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import { Link } from "@components/Link";
import { postgrest, WithAuth } from "@src/utils/postgrest";

export default function LayoutDefault({
    children,
}: {
    children: React.ReactNode;
}) {
    return <Content>{children}</Content>;
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
    const context = usePageContext();
    let [links, setLinks] = useState<
        ({ name: string; id: string; href: string } | undefined)[]
    >([]);

    useEffect(() => {
        links = [];

        const subject_id = context.routeParams.subject_id;
        {
            if (subject_id && subject_id != "0") {
                new WithAuth(
                    postgrest
                        .from("subjects")
                        .select("name")
                        .eq("id", subject_id)
                        .single(),
                )
                    .unwrap()
                    .then(({ data, error }) => {
                        if (error) return;
                        links[0] = {
                            id: subject_id,
                            name: (data as Subject).name,
                            href: `/collections/subjects/${subject_id}`,
                        };
                        context.config.collection = {
                            ...context.config.collection,
                            subject_name: (data as Subject).name,
                        };
                        setLinks([...links]);
                    });
            }
        }
        const topic_id = context.routeParams.topic_id;
        {
            if (topic_id && topic_id != "0") {
                new WithAuth(
                    postgrest
                        .from("topics")
                        .select("title")
                        .eq("id", topic_id)
                        .single(),
                )
                    .unwrap()
                    .then(({ data, error }) => {
                        if (error) return;
                        links[1] = {
                            id: topic_id,
                            name: (data as Topic).title,
                            href: `/collections/subjects/${subject_id}/${topic_id}`,
                        };
                        context.config.collection = {
                            ...context.config.collection,
                            topic_title: (data as Topic).title,
                        };
                        setLinks([...links]);
                    });
            }
        }

        const objective_id = context.routeParams.objective_id;
        {
            if (objective_id && objective_id != "0") {
                new WithAuth(
                    postgrest
                        .from("objectives")
                        .select("title")
                        .eq("id", objective_id)
                        .single(),
                )
                    .unwrap()
                    .then(({ data, error }) => {
                        if (error) return;
                        links[2] = {
                            id: objective_id,
                            name: (data as Topic).title,
                            href: `/collections/subjects/${subject_id}/${topic_id}/${objective_id}`,
                        };
                        context.config.collection = {
                            ...context.config.collection,
                            objective_title: (data as Objective).title,
                        };
                        setLinks([...links]);
                    });
            }
        }
    }, [context.routeParams]);

    const [currentPath, setCurrentPath] = useState("");
    useEffect(() => {
        let path = context.urlPathname
            .slice(1)
            .split("/")
            .slice(0, 2)
            .join(" ")
            .replace("collections", "")
            .trim();
        setCurrentPath(path);
    }, [context.urlPathname]);

    return (
        <div id="page-container" className="w-full">
            <div
                id="page-content"
                className="h-screen overflow-hidden w-ful py-4"
            >
                <div className="text-xs flex items-center gap-3 px-4">
                    {currentPath && (
                        <a
                            className="hover:text-zinc-400 transition-all duration-300 bg-zinc-200 rounded-md px-2 py-1 capitalize"
                            href={"/collections/subjects"}
                            onClick={() => setLinks([])}
                        >
                            {currentPath}
                        </a>
                    )}
                    {links
                        .filter((v) => !!v)
                        .map((v, k) => (
                            <Fragment key={`${k}-${new Date().getTime()}`}>
                                <span>/</span>
                                <a
                                    className="hover:text-zinc-400 transition-all duration-300 bg-zinc-200 rounded-md px-2 py-1"
                                    href={v.href}
                                    dangerouslySetInnerHTML={{ __html: v.name }}
                                />
                            </Fragment>
                        ))}
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
