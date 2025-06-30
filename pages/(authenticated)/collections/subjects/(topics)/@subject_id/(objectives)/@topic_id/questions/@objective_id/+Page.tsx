import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { postgrest, WithAuth } from "@src/utils/postgrest";
import Table from "@components/Table";
import { questionOptionString, sortTag, tagTitle } from "@src/utils/helper";
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
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const context = usePageContext();
    const objective_id = context.routeParams.objective_id;

    useEffect(() => {
        new WithAuth(
            postgrest
                .from("question_view")
                .select()
                .eq("objective_id", objective_id),
        )
            .unwrap()
            .then(({ data, error }) => {
                setLoading(false);
                if (error) return;
                setQuestions(data);
            });
    }, []);

    return (
        <Fragment>
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
                                title: (
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: `Create Question - ${context.config.collection?.objective_title}`,
                                        }}
                                    />
                                ),
                            },
                        )
                    }
                />
            </div>
            <Table<Question>
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
                        key: "question",
                        width: 600,
                    },
                    {
                        key: "tag",
                        display_name: "Jamb / Waec",
                        width: 50,
                    },
                    {
                        key: "option_1",
                        display_name: "Option A",
                        width: 150,
                    },
                    {
                        key: "option_2",
                        display_name: "Option B",
                        width: 150,
                    },
                    {
                        key: "option_3",
                        display_name: "Option C",
                        width: 150,
                    },
                    {
                        key: "option_4",
                        display_name: "Option D",
                        width: 150,
                    },
                    {
                        key: "short_answer",
                        display_name: "Answer",
                        width: 50,
                    },
                    {
                        key: "_action",
                        display_name: "Action",
                        width: 50,
                    },
                ]}
                rows={questions
                    .sort((a, b) => sortTag(a.tag, b.tag))
                    .map((v, idx) => ({
                        value: { ...v, idx: idx + 1 },
                        render: (question, idx) => {
                            switch (idx) {
                                case "_action":
                                    return <DeleteButton id={question.id} />;
                                case "tag":
                                    return (
                                        <span className="whitespace-nowrap">
                                            {tagTitle(question.tag)}
                                        </span>
                                    );
                                case "short_answer":
                                    return (
                                        <span className="whitespace-nowrap">
                                            {questionOptionString(
                                                question.short_answer,
                                            )}
                                        </span>
                                    );
                                case "idx":
                                    return (
                                        <div className="flex gap-2 group w-10 items-center">
                                            <span className="w-5">
                                                {
                                                    (
                                                        question as Record<
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
                                                                    question
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
                                                                        __html: question.question,
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
                                            className="line-clamp-2"
                                            dangerouslySetInnerHTML={{
                                                __html: (
                                                    question as Record<
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
        </Fragment>
    );
}

const FormComponent = ({
    closeFn,
    formData,
    pageContext,
}: {
    closeFn: CloseFn;
    formData?: Question;
    pageContext: ReturnType<typeof usePageContext>;
}) => {
    const subject_id = pageContext.routeParams.subject_id;
    const [topicId, setTopicId] = useState(pageContext.routeParams.topic_id);
    const [objectiveId, setObjectiveId] = useState(
        pageContext.routeParams.objective_id,
    );

    const [loading, setLoading] = useState(false);
    const [form, setFormState] = useState({
        question: formData?.question ?? "",
        question_details: formData?.question_details ?? "",
        tag: formData?.tag ?? "J",
        subject_id,
    });
    const [message, setMessage] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    const writerQuestionRef = useRef<HTMLInputElement>(null);

    const onSubmit = async () => {
        setMessage(null);
        const isValid = formRef.current?.checkValidity();
        if (!isValid) return;
        setLoading(true);

        let __form: Record<string, any> = {
            ...form,
            content: writerQuestionRef.current?.value,
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
                ref={formRef}
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
                <Writer
                    title="Question"
                    defaultValue={form.question}
                    ref={writerQuestionRef}
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
                    title="Question details"
                    defaultValue={form.question_details}
                    ref={writerQuestionRef}
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
    const __table = "questions";

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
