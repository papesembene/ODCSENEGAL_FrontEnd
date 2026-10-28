export default function AnimatedSection({ children, className, delay = 0, ...props }) {
  return (
    <div
      data-reveal=""
      data-reveal-delay={Math.min(delay * 1000, 150)}
      className={className}
      {...props}
    >
      {children}
    </div>
  )
}
