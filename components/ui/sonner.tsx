"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "group toast font-medium-heading group-[.toaster]:bg-gradient-to-br group-[.toaster]:from-slate-50 group-[.toaster]:to-slate-100 dark:group-[.toaster]:from-slate-900 dark:group-[.toaster]:to-slate-950 group-[.toaster]:text-gray-700 group-[.toaster]:border group-[.toaster]:border-slate-200 dark:group-[.toaster]:border-slate-800 group-[.toaster]:shadow-xl group-[.toaster]:backdrop-blur-md",
          description: "group-[.toast]:text-muted-foreground font-medium-heading",
          title: "font-medium-heading",
          actionButton: "group-[.toast]:bg-blue-600 group-[.toast]:text-white hover:group-[.toast]:bg-blue-700",
          cancelButton: "group-[.toast]:bg-slate-200 dark:group-[.toast]:bg-slate-800 group-[.toast]:text-slate-700 dark:group-[.toast]:text-slate-300",
          success: "group-[.toast]:border-blue-600/40 group-[.toast]:bg-gradient-to-br group-[.toast]:from-blue-100 group-[.toast]:to-blue-200 dark:group-[.toast]:from-blue-900/70 dark:group-[.toast]:to-blue-800/70 group-[.toast]:shadow-blue-500/20",
          error: "group-[.toast]:border-red-500/30 group-[.toast]:bg-gradient-to-br group-[.toast]:from-red-50 group-[.toast]:to-red-100 dark:group-[.toast]:from-red-950/50 dark:group-[.toast]:to-red-900/50",
          warning: "group-[.toast]:border-amber-500/30 group-[.toast]:bg-gradient-to-br group-[.toast]:from-amber-50 group-[.toast]:to-amber-100 dark:group-[.toast]:from-amber-950/50 dark:group-[.toast]:to-amber-900/50",
          info: "group-[.toast]:border-blue-500/30 group-[.toast]:bg-gradient-to-br group-[.toast]:from-blue-50 group-[.toast]:to-blue-100 dark:group-[.toast]:from-blue-950/50 dark:group-[.toast]:to-blue-900/50",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-5 text-blue-600 dark:text-blue-400" />,
        info: <InfoIcon className="size-5 text-blue-600 dark:text-blue-400" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-600 dark:text-amber-400" />,
        error: <OctagonXIcon className="size-5 text-red-600 dark:text-red-400" />,
        loading: <Loader2Icon className="size-5 animate-spin text-blue-600 dark:text-blue-400" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
