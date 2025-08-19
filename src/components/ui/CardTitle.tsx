export default function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2 className={`font-semibold text-lg ${className}`} {...props}>
      {children}
    </h2>
  );
}
