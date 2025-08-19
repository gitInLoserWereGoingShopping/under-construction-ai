import React from "react";

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className = "", ...props }, ref) => (
  <textarea
    ref={ref}
    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-900 ${className}`}
    {...props}
  />
));

export default TextArea;
