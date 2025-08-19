export default function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mt-1 ${className}`} {...props}>
      {children}
    </div>
  );
}
