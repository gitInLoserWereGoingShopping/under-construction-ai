export default function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-2 ${className}`} {...props}>
      {children}
    </div>
  );
}
