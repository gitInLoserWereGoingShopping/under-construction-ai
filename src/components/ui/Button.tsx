export default function Button({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
  size?: string;
}) {
  return (
    <button
      className={`rounded-lg px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-700 transition ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
