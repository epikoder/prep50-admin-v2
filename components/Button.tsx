import { ButtonHTMLAttributes, cloneElement, ReactNode } from "react";
import { clientOnly } from "vike-react/clientOnly";

export { RippleButton };
const RippleButton = clientOnly(() => import("./RippleButton.client"));

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  preset?: "normal" | "danger" | "unstyled";
  presetStyle?: ButtonHTMLAttributes<HTMLButtonElement>["className"];
}

const Button = (
  {
    title,
    children,
    className: sx,
    preset = "normal",
    presetStyle,
    ...props
  }: ButtonProps,
) => (
  <RippleButton>
    <button
      {...props}
      className={`${
        sx ?? ""
      } flex justify-center items-center gap-2 rounded-md px-8 py-1 text-xs ${
        presetStyle ??
          "text-white"
      } ${
        !props.disabled
          ? (preset === "normal"
            ? "bg-green-500 bg-opacity-85 border-green-500 border"
            : preset === "danger"
            ? "bg-red-500 bg-opacity-85 border-red-500 border"
            : presetStyle)
          : "bg-gray-500 bg-opacity-85 border-gray-500 border"
      }`}
    >
      <span>
        {title}
      </span>
      {children}
    </button>
  </RippleButton>
);

export default Button;
