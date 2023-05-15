import { forwardRef } from "react";

interface InputProps {
  id: string;
  type: string;
  label: string;
  classnm?: string;
  classlabel?: string;
  min?: string;
  step?: string;
  defaultValue?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <div className="flex flex-col w-full p-2 justify-around">
      <label
        className={`w-fit p-1 backdrop-blur-xl rounded !bg-opacity-20 ${props.classlabel}`}
        htmlFor={props.id}
      >
        {props.label}
      </label>
      <input
        ref={ref}
        className={`border-b-2 border-solid bg-transparent outline-none ${props.classnm}`}
        {...props}
        name={props.id}
      />
    </div>
  );
});

export default Input;
