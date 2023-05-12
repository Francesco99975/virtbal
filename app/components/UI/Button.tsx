import { PropsWithChildren } from "react";

interface ButtonProps {
  type: "button" | "submit" | "reset" | undefined;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const Button = (props: PropsWithChildren<ButtonProps>) => {
  return (
    <button
      className={`p-2 mt-1 text-center rounded ${props.className}`}
      type={props.type}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default Button;
