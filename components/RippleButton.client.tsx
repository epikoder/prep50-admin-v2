import { cloneElement, ReactElement, useEffect } from "react";
import { useRipple } from "../hooks/useRipple";

interface RippleProps {
    children: ReactElement;
}

export default function RippleButton(
    { children }: RippleProps,
) {
    const ref = useRipple();
    useEffect(() => {
    }, [typeof window]);

    return cloneElement(children, {
        ...children.props,
        ref,
        className: children.props.className + " ripple",
    });
}
