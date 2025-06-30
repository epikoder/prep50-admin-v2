import { ChangeEvent, useEffect, useRef, useState } from "react";
import { postgrest, WithAuth } from "@src/utils/postgrest";
import Table from "@components/Table";
import { sortTag, tagTitle } from "@src/utils/helper";
import {
    ActivityIndicator,
    ExpandIcon,
    KeyIcon,
} from "@components/Icons";
import {
    CloseFn,
    mountModal,
} from "@components/Modal";
import { usePageContext } from "vike-react/usePageContext";
import {
    SelectObjective,
    SelectSubject,
    SelectTag,
    SelectTopic,
} from "@components/Select";
import Input from "@components/Input";
import Button from "@components/Button";
import { showAlertDialog } from "@components/Dialog";
import Toast from "@src/utils/toast";
import Writer from "@components/Writer";

export default function () {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);
    const context = usePageContext();
    const objective_id = context.routeParams.objective_id;

    useEffect(() => {
        new WithAuth(
            postgrest
                .from("lesson_view")
                .select()
                .eq("objective_id", objective_id),
        )
            .unwrap()
            .then(({ data, error }) => {
                setLoading(false);
                if (error) return;
                setLessons(data);
            });
    }, []);

    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div ref={containerRef}>
            <div className="p-2">
                <Button
                    title="New lesson"
                    className="text-xs"
                    onClick={() =>
                        mountModal(
                            ({ closeFn }) => (
                                <FormComponent
                                    pageContext={context}
                                    closeFn={closeFn}
                                />
                            ),
                            {
                                title: `Create Lesson - ${context.config.collection?.objective_title}`,
                            },
                        )
                    }
                />
            </div>
            <Table<Lesson>
                loading={loading}
                columns={[
                    {
                        key: "idx",
                        width: 50,
                        render: () => (
                            <div className="flex gap-2">
                                <span className="w-5">ID</span>
                                <KeyIcon className="rotate-45 size-4 text-green-500" />
                            </div>
                        ),
                    },
                    {
                        key: "title",
                        width: 300,
                    },
                    {
                        key: "tag",
                        display_name: "Jamb / Waec",
                        width: 50,
                    },
                    {
                        key: "content",
                        display_name: "Notes",
                        width: (containerRef.current?.clientWidth ?? 800) / 2,
                    },
                ]}
                rows={lessons
                    .sort((a, b) => sortTag(a.tag, b.tag))
                    .map((v, idx) => ({
                        value: { ...v, idx: idx + 1 },
                        render: (lesson, idx) => {
                            switch (idx) {
                                case "tag":
                                    return (
                                        <span className="whitespace-nowrap">
                                            {tagTitle(lesson.tag)}
                                        </span>
                                    );
                                case "content":
                                    return (
                                        <span
                                            className="line-clamp-3"
                                            dangerouslySetInnerHTML={{
                                                __html: lesson.content,
                                            }}
                                        />
                                    );
                                case "idx":
                                    return (
                                        <div className="flex gap-2 group w-10 items-center">
                                            <span className="w-5">
                                                {
                                                    (
                                                        lesson as Record<
                                                            string,
                                                            any
                                                        >
                                                    )[idx]
                                                }
                                            </span>
                                            <ExpandIcon
                                                className="size-3 transition-all duration-200 group-hover:size-5 cursor-pointer text-green-500"
                                                onClick={() => {
                                                    mountModal(
                                                        ({ closeFn }) => (
                                                            <FormComponent
                                                                pageContext={
                                                                    context
                                                                }
                                                                formData={
                                                                    lesson
                                                                }
                                                                closeFn={
                                                                    closeFn
                                                                }
                                                            />
                                                        ),
                                                        {
                                                            title: (
                                                                <span
                                                                    dangerouslySetInnerHTML={{
                                                                        __html: lesson.title,
                                                                    }}
                                                                />
                                                            ),
                                                        },
                                                    );
                                                }}
                                            />
                                        </div>
                                    );
                                default:
                                    return (
                                        <span
                                            dangerouslySetInnerHTML={{
                                                __html: (
                                                    lesson as Record<
                                                        string,
                                                        any
                                                    >
                                                )[idx],
                                            }}
                                        />
                                    );
                            }
                        },
                    }))}
            />
        </div>
    );
}

const FormComponent = ({
    closeFn,
    formData,
    pageContext,
}: {
    closeFn: CloseFn;
    formData?: Lesson;
    pageContext: ReturnType<typeof usePageContext>;
}) => {
    const subject_id = pageContext.routeParams.subject_id;
    const [topicId, setTopicId] = useState(pageContext.routeParams.topic_id);
    const [objectiveId, setObjectiveId] = useState(
        pageContext.routeParams.objective_id,
    );

    const [loading, setLoading] = useState(false);
    const [form, setFormState] = useState({
        title: formData?.title ?? "",
        tag: formData?.tag ?? "J",
        content: formData?.content ?? "",
        subject_id,
    });
    const ref = useRef<HTMLFormElement>(null);
    const writerRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState<string | null>(null);

    const onSubmit = async () => {
        setMessage(null);
        const isValid = ref.current?.checkValidity();
        if (!isValid) return;
        setLoading(true);

        let __form: Record<string, any> = {
            ...form,
            content: writerRef.current?.value,
        };

        if (formData) {
            __form["id"] = formData.id;
        }
        const { data, error } = await new WithAuth(
            postgrest.from("lessons").upsert(__form).select().single(),
        ).unwrap();
        setLoading(false);
        if (error) {
            setMessage("Something went wrong");
            return;
        }
        // when creating new objective
        if (!formData) {
            const { error } = await new WithAuth(
                postgrest.from("objective_lessons").insert({
                    lesson_id: data.id,
                    objective_id: objectiveId,
                }),
            ).unwrap();
            if (error) {
                // revert
                await new WithAuth(
                    postgrest.from("lessons").delete().eq("id", data.id),
                ).unwrap();
                setMessage("Something went wrong");
                return;
            }
        } else {
            await new WithAuth(
                postgrest
                    .from("objective_lessons")
                    .update({
                        objective_id: objectiveId,
                    })
                    .eq("lesson_id", data.id),
            ).unwrap();
        }
        location.reload();
    };

    const _setFormState = (ev: ChangeEvent<HTMLInputElement>) =>
        setFormState({ ...form, [ev.target.name]: ev.target.value });

    return (
        <div className="max-w-[500px] mx-auto flex flex-col gap-12">
            <form
                ref={ref}
                className="flex flex-col gap-3"
                onSubmit={(ev) => {
                    ev.preventDefault();
                    onSubmit();
                }}
            >
                {message && (
                    <div className="text-red-500 text-sm text-center">
                        {message}
                    </div>
                )}
                <SelectSubject
                    defaultValue={form.subject_id}
                    onChange={(v) =>
                        setFormState({
                            ...form,
                            subject_id: v.currentTarget.value,
                        })
                    }
                />

                <SelectTopic
                    subject_id={form.subject_id}
                    defaultValue={topicId}
                    onChange={(v) => setTopicId(v.currentTarget.value)}
                />

                <SelectObjective
                    topic_id={topicId}
                    defaultValue={objectiveId}
                    onChange={(v) => setObjectiveId(v.currentTarget.value)}
                />
                <Input
                    name="title"
                    placeholder="Title"
                    defaultValue={form.title}
                    onChange={_setFormState}
                    required
                />
                <SelectTag
                    defaultValue={form.tag}
                    onChange={(v) =>
                        setFormState({
                            ...form,
                            tag: v.currentTarget.value as Tag,
                        })
                    }
                />
                <Writer
                    key={"writer"}
                    defaultValue={form.content}
                    ref={writerRef}
                />
                <Button title="Submit">
                    {loading && <ActivityIndicator active />}
                </Button>
            </form>
            {formData && <DeleteButton id={formData.id} />}
        </div>
    );
};

const DeleteButton = ({ id }: { id: any }) => {
    const [loading, setLoading] = useState(false);
    const __table = "lessons";

    return (
        <Button
            title="Delete"
            preset="danger"
            onClick={() => {
                showAlertDialog({
                    title: "Confirm Delete",
                    message: (
                        <div>
                            This action is irreversible, confirm the operation.
                        </div>
                    ),
                    onContinue: async () => {
                        setLoading(true);
                        const { error } = await new WithAuth(
                            postgrest.from(__table).delete().eq("id", id),
                        ).unwrap();
                        setLoading(false);
                        if (error) {
                            Toast.error("Something went wrong");
                            throw new Error("");
                        }

                        setTimeout(() => {
                            location.reload();
                        }, 200);
                    },
                });
            }}
        >
            {loading && <ActivityIndicator active />}
        </Button>
    );
};
