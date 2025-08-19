export default function Card({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative rounded-2xl border bg-white p-4 shadow ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
