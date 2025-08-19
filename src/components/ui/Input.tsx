import React from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => (
  <input
    ref={ref}
    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 ${className}`}
    {...props}
  />
));

export default Input;
