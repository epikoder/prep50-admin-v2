import { ChangeEvent, Fragment, useEffect, useRef, useState } from "react";
import { postgrest, WithAuth } from "../../../../src/utils/postgrest";
import Table from "../../../../components/Table";
import { sortTag, tagTitle } from "../../../../src/utils/helper";
import {
  ActivityIndicator,
  ExpandIcon,
  KeyIcon,
} from "../../../../components/Icons";
import { CloseFn, mountModal } from "../../../../components/Modal";
import Button from "../../../../components/Button";
import Input from "../../../../components/Input";
import { SelectTag } from "../../../../components/Select";
import { showAlertDialog } from "../../../../components/Dialog";
import Toast from "../../../../src/utils/toast";

export default function () {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    new WithAuth(postgrest.from("subjects").select()).unwrap().then(
      ({ data, error }) => {
        setLoading(false);
        if (error) return;
        setSubjects(data);
      },
    );
  }, []);

  return (
    <Fragment>
      <div className="p-2">
        <Button
          title="New Subject"
          className="text-xs"
          onClick={() =>
            mountModal(
              ({ closeFn }) => <FormComponent closeFn={closeFn} />,
              {
                title: "Create subject",
              },
            )}
        />
      </div>
      <Table<Subject>
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
            key: "name",
            width: 300,
          },
          {
            key: "tag",
            display_name: "Jamb / Waec",
            width: 50,
          },
          {
            key: "_topics",
            display_name: "Topics",
            width: 50,
          },
        ]}
        rows={subjects.sort((a, b) => a.id - b.id).map((v, idx) => ({
          value: { ...v, idx: idx + 1 },
          render: (subject, idx) => {
            switch (idx) {
              case "_topics":
                return (
                  <a
                    className="text-xs px-4 py-1 rounded transition-all duration-300 bg-green-500 hover:bg-opacity-60 text-white"
                    href={`/collections/subjects/${subject.id}`}
                  >
                    Topics
                  </a>
                );
              case "tag":
                return (
                  <span className="whitespace-nowrap">
                    {tagTitle(subject.tag)}
                  </span>
                );
              case "idx":
                return (
                  <div className="flex items-center gap-2 group w-10">
                    <span className="w-5">
                      {(subject as Record<string, any>)[idx]}
                    </span>
                    <ExpandIcon
                      className="size-3 transition-all duration-200 group-hover:size-5 cursor-pointer text-green-500"
                      onClick={() => {
                        mountModal(
                          ({ closeFn }) => (
                            <FormComponent
                              closeFn={closeFn}
                              formData={subject}
                            />
                          ),
                          {
                            title: subject.name,
                          },
                        );
                      }}
                    />
                  </div>
                );
              default:
                return (subject as Record<string, any>)[idx];
            }
          },
        }))}
      />
    </Fragment>
  );
}

const FormComponent = (
  { closeFn, formData }: { closeFn: CloseFn; formData?: Subject },
) => {
  const [loading, setLoading] = useState(false);
  const [form, setFormState] = useState({
    name: formData?.name ?? "",
    tag: formData?.tag ?? "J",
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
    let query = postgrest.from("subjects").upsert(__form);
    const { error } = await new WithAuth(
      query,
    ).unwrap();
    setLoading(false);
    if (error) {
      setMessage("Something went wrong");
      return;
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
        <Input
          name="name"
          placeholder="Name"
          defaultValue={form.name}
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
  const __table = "subjects";

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
