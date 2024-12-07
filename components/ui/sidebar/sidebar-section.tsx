import { cn } from "@/lib/utils/cn"

interface SidebarSectionProps {
  title?: string
  children: React.ReactNode
  className?: string
  isCollapsed?: boolean
}

export function SidebarSection({
  title,
  children,
  className,
  isCollapsed
}: SidebarSectionProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {title && !isCollapsed && (
        <h3 className="mb-2 px-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
          {title}
        </h3>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  )
} 