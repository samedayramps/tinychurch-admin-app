import Link from "next/link"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { buttonVariants } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"

interface SidebarItemProps {
  href: string
  icon: LucideIcon
  title: string
  isActive?: boolean
  isCollapsed?: boolean
  isDisabled?: boolean
  badge?: React.ReactNode
}

export function SidebarItem({
  href,
  icon: Icon,
  title,
  isActive,
  isCollapsed,
  isDisabled,
  badge
}: SidebarItemProps) {
  const MenuItem = (
    <Link
      href={href}
      className={cn(
        "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium",
        "hover:bg-accent/50 hover:text-accent-foreground",
        "transition-colors duration-200 ease-in-out",
        "min-h-[40px]",
        isActive && "bg-accent text-accent-foreground",
        isDisabled && "pointer-events-none opacity-50",
        isCollapsed && "justify-center"
      )}
    >
      <Icon className={cn(
        "h-4 w-4 shrink-0",
        isActive ? "text-current" : "text-muted-foreground group-hover:text-current"
      )} />
      {!isCollapsed && (
        <>
          <span className="ml-3 flex-1 truncate">{title}</span>
          {badge && (
            <span className="ml-2 flex-shrink-0">{badge}</span>
          )}
        </>
      )}
    </Link>
  )

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {MenuItem}
          </TooltipTrigger>
          <TooltipContent 
            side="right" 
            className="flex items-center gap-4 bg-background/80 backdrop-blur-lg"
          >
            {title}
            {badge}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return MenuItem
} 