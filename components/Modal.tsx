import { ReactNode } from "react";
import { createRoot } from "react-dom/client";

export type CloseFn = (_: HTMLElement) => void;
export const mountModal = (
    children: (_: { closeFn: CloseFn }) => ReactNode,
    props?: ModalProps,
) => {
    const container = document.createElement("div");
    const closeFn = (el: HTMLElement) => el.remove();
    const root = createRoot(container);
    root.render(
        <Modal {...props} closeFn={closeFn}>
            {children({ closeFn })}
        </Modal>,
    );
    document.body.append(container);
};

interface ModalProps {
    title?: ReactNode;
    closeFn?: CloseFn;
}

export default function Modal(
    { children, title, closeFn }: ModalProps & { children: ReactNode },
) {
    return (
        <div
            className={"fixed z-[99] inset-0 w-[100vw] h-[100vh] bg-gray-400 bg-opacity-40 backdrop-blur-[1px] flex flex-col justify-center items-center"}
            onClick={(ev) => {
                ev.stopPropagation();
                closeFn!(ev.currentTarget);
            }}
        >
            <div
                className="fixed z-50 w-full max-w-screen-sm right-0 top-0 bottom-0 bg-white"
                onClick={(ev) => ev.stopPropagation()}
            >
                <div className="py-2 text-center text-sm uppercase font-semibold border-b border-zinc-500 line-clamp-2">
                    {title}
                </div>
                <div className="py-4 px-2 pb-12 h-full overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    );
}
