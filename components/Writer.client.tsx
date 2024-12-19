import React, {
    ChangeEvent,
    forwardRef,
    Fragment,
    HTMLAttributes,
    useEffect,
    useRef,
} from "react";
import Quill, { QuillOptions } from "quill";

export default forwardRef<
    HTMLInputElement,
    Omit<HTMLAttributes<HTMLInputElement>, "onChange">
>((
    { ...props },
    ref,
) => {
    const quillRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (typeof document == "undefined" || typeof window == "undefined") {
            return;
        }

        const toolbarOptions = [
            [{ "size": ["small", false, "large", "huge"] }], // custom dropdown
            [{ "header": [1, 2, 3, 4, 5, 6, false] }],
            [{ "font": [] }],

            ["bold", "italic", "underline", "strike"], // toggled buttons
            ["blockquote", "code-block"],
            ["link", "formula"],

            [{ "header": 1 }, { "header": 2 }], // custom button values
            [{ "list": "ordered" }, { "list": "bullet" }, { "list": "check" }],
            [{ "script": "sub" }, { "script": "super" }], // superscript/subscript
            [{ "indent": "-1" }, { "indent": "+1" }], // outdent/indent

            [{ "align": [] }],

            ["clean"], // remove formatting button
        ];
        const quill = new Quill(
            quillRef.current!,
            {
                modules: {
                    toolbar: toolbarOptions,
                    table: true,
                },
                placeholder: "type here...", //data[attribute.field] ?? "",
                theme: "snow",
            } satisfies QuillOptions,
        );
        quill.on("text-change", () => {
            const v = quill.root.innerHTML;
            (ref as React.RefObject<HTMLInputElement>).current!.value = v;
        });
    }, []);

    return (
        <Fragment>
            <div>
                {props.title && (
                    <div className="py-1 font-semibold capitalize text-sm">
                        {props.title}
                    </div>
                )}
                <div
                    ref={quillRef}
                    dangerouslySetInnerHTML={{
                        __html: props.defaultValue ?? "",
                    }}
                />
            </div>
            <input {...props} hidden ref={ref} />
        </Fragment>
    );
});
