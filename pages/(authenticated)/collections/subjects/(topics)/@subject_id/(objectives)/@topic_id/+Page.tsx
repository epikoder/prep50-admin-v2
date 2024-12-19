import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import {
  postgrest,
  WithAuth,
} from "../../../../../../../../src/utils/postgrest";
import Table from "../../../../../../../../components/Table";
import { sortTag, tagTitle } from "../../../../../../../../src/utils/helper";
import {
  ActivityIndicator,
  ExpandIcon,
  KeyIcon,
} from "../../../../../../../../components/Icons";
import { CloseFn, mountModal } from "../../../../../../../../components/Modal";
import { usePageContext } from "vike-react/usePageContext";
import Button from "../../../../../../../../components/Button";
import { showAlertDialog } from "../../../../../../../../components/Dialog";
import Input from "../../../../../../../../components/Input";
import {
  SelectSubject,
  SelectTag,
  SelectTopic,
} from "../../../../../../../../components/Select";
import Toast from "../../../../../../../../src/utils/toast";

export default function () {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const context = usePageContext();
  const subject_id = context.routeParams.subject_id;
  const topic_id = context.routeParams.topic_id;

  useEffect(() => {
    new WithAuth(
      postgrest.from("objectives_view").select().eq(
        "topic_id",
        topic_id,
      ),
    ).unwrap().then(
      ({ data, error }) => {
        setLoading(false);
        if (error) return;
        setObjectives(data);
      },
    );
  }, []);

  return (
    <Fragment>
      <div className="p-2">
        <Button
          title="New Objective"
          className="text-xs"
          onClick={() =>
            mountModal(
              ({ closeFn }) => (
                <FormComponent pageContext={context} closeFn={closeFn} />
              ),
              {
                title:
                  `Create Objective - ${context.config.collection?.topic_title}`,
              },
            )}
        />
      </div>
      <Table<Objective>
        loading={loading}
        columns={[
          {
            key: "idx",
            width: 50,
            render: () => (
              <div className="flex gap-2">
                <span className="w-5">
                  ID
                </span>
                <KeyIcon className="rotate-45 size-4 text-green-500" />
              </div>
            ),
          },
          {
            key: "title",
            width: 500,
          },
          {
            key: "tag",
            display_name: "Jamb / Waec",
            width: 50,
          },
          {
            key: "_lessons",
            display_name: "Lessons",
            width: 80,
          },
          {
            key: "_questions",
            display_name: "Questions",
            width: 80,
          },
        ]}
        rows={objectives.sort((a, b) => a.id - b.id).map((
          v,
          idx,
        ) => ({
          value: { ...v, idx: idx + 1 },
          render: (objective, idx) => {
            switch (idx) {
              case "_lessons":
                return (
                  <a
                    className="text-xs px-4 py-1 rounded transition-all duration-300 bg-green-500 hover:bg-opacity-60 text-white"
                    href={`/collections/subjects/${subject_id}/${topic_id}/lessons/${objective.id}`}
                  >
                    Lessons
                  </a>
                );
              case "_questions":
                return (
                  <a
                    className="text-xs px-4 py-1 rounded transition-all duration-300 bg-green-500 hover:bg-opacity-60 text-white"
                    href={`/collections/subjects/${subject_id}/${topic_id}/questions/${objective.id}`}
                  >
                    Questions
                  </a>
                );
              case "tag":
                return (
                  <span className="whitespace-nowrap">
                    {tagTitle(objective.tag)}
                  </span>
                );
              case "idx":
                return (
                  <div className="flex gap-2 group w-10 items-center">
                    <span className="w-5">
                      {(objective as Record<string, any>)[idx]}
                    </span>
                    <ExpandIcon
                      className="size-3 transition-all duration-200 group-hover:size-5 cursor-pointer text-green-500"
                      onClick={() => {
                        mountModal(
                          ({ closeFn }) => (
                            <FormComponent
                              pageContext={context}
                              closeFn={closeFn}
                              formData={objective}
                            />
                          ),
                          {
                            title: (
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: objective.title,
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
                      __html: (objective as Record<string, any>)[idx],
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

const FormComponent = (
  { closeFn, formData, pageContext }: {
    closeFn: CloseFn;
    formData?: Objective;
    pageContext: ReturnType<typeof usePageContext>;
  },
) => {
  const subject_id = pageContext.routeParams.subject_id;
  const [topicId, setTopicId] = useState(pageContext.routeParams.topic_id);

  const [loading, setLoading] = useState(false);
  const [form, setFormState] = useState({
    title: formData?.title ?? "",
    tag: formData?.tag ?? "J",
    subject_id,
  });
  const ref = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState<string | null>(null);

  const onSubmit = async () => {
    setMessage(null);
    const isValid = ref.current?.checkValidity();
    if (!isValid) return;
    setLoading(true);

    let __form: Record<string, any> = { ...form };
    if (formData) {
      __form["id"] = formData.id;
    }
    const { data, error } = await new WithAuth(
      postgrest.from("objectives").upsert(__form).select().single(),
    ).unwrap();
    setLoading(false);
    if (error) {
      setMessage("Something went wrong");
      return;
    }
    // when creating new objective
    if (!formData) {
      const { error } = await new WithAuth(
        postgrest.from("topic_objectives").insert({
          topic_id: topicId,
          objective_id: data.id,
        }),
      ).unwrap();
      if (error) {
        // revert
        await new WithAuth(
          postgrest.from("objectives").delete().eq("id", data.id),
        ).unwrap();
        setMessage("Something went wrong");
        return;
      }
    } else {
      await new WithAuth(
        postgrest.from("topic_objectives").update({
          topic_id: topicId,
        }).eq("objective_id", data.id),
      ).unwrap();
    }
    location.reload();
  };

  const _setFormState = (ev: ChangeEvent<HTMLInputElement>) =>
    setFormState({ ...form, [ev.target.name]: ev.target.value });

  return (
    <div className="max-w-[400px] mx-auto flex flex-col gap-12">
      <form
        ref={ref}
        className="flex flex-col gap-3"
        onSubmit={(ev) => {
          ev.preventDefault();
          onSubmit();
        }}
      >
        {message && (
          <div className="text-red-500 text-sm text-center">{message}</div>
        )}
        <SelectSubject
          defaultValue={form.subject_id}
          onChange={(v) =>
            setFormState({
              ...form,
              subject_id: v.currentTarget.value,
            })}
        />

        <SelectTopic
          subject_id={form.subject_id}
          defaultValue={topicId}
          onChange={(v) => setTopicId(v.currentTarget.value)}
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
            })}
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
  const __table = "objectives";

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
