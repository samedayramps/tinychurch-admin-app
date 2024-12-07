"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { ChevronLeft, Menu } from "lucide-react"
import { cn } from "@/lib/utils/cn"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMounted } from "@/lib/hooks/use-mounted"

interface SidebarProps {
  children: React.ReactNode
  className?: string
  defaultCollapsed?: boolean
}

const sidebarVariants = cva(
  "relative flex flex-col border-r bg-background/60 backdrop-blur-xl transition-all duration-300 ease-in-out",
  {
    variants: {
      collapsed: {
        true: "w-[70px]",
        false: "w-[280px]",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
)

export function Sidebar({ 
  children, 
  className,
  defaultCollapsed = false 
}: SidebarProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  const [isOpen, setIsOpen] = React.useState(false)
  const mounted = useMounted()
  
  // Create a context value for child components
  const contextValue = React.useMemo(
    () => ({ collapsed, setCollapsed }),
    [collapsed]
  )
  
  // Only show mobile sidebar after mounting to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile Trigger - Moved to right side */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed right-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent 
          side="left" 
          className="w-[280px] p-0 border-r-0"
        >
          <div className="flex justify-end p-4 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-4rem)] pb-8">
            <div className="p-4">
              {children}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          sidebarVariants({ collapsed }),
          "hidden h-screen md:flex sticky top-0 shadow-sm",
          className
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-sm",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            "transition-transform duration-200",
            "hidden md:flex",
            collapsed && "rotate-180"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-4 p-4">
            {children}
          </div>
        </ScrollArea>
      </aside>
    </>
  )
}

// Create a context to share the collapsed state
export const SidebarContext = React.createContext<{
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}>({
  collapsed: false,
  setCollapsed: () => {},
})

// Hook to access the sidebar context
export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a Sidebar")
  }
  return context
} 