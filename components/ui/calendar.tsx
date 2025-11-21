"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  month,
  onMonthChange,
  ...props
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(month || new Date())

  const monthsShort = [
    "Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.",
    "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."
  ]
  
  const monthsFull = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]

  const maxYear = 2050
  const years = Array.from({ length: maxYear - 1920 + 1 }, (_, i) => 1920 + i).reverse()

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(parseInt(monthIndex))
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  const handleYearChange = (year: string) => {
    const newMonth = new Date(currentMonth)
    newMonth.setFullYear(parseInt(year))
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  React.useEffect(() => {
    if (month) {
      setCurrentMonth(month)
    }
  }, [month])

  const CustomCaption = () => (
    <div className="flex justify-center items-center gap-2 mb-4">
      <Select value={currentMonth.getMonth().toString()} onValueChange={handleMonthChange}>
        <SelectTrigger className="h-8 w-[110px]">
          <SelectValue placeholder={monthsShort[currentMonth.getMonth()]} />
        </SelectTrigger>
        <SelectContent>
          {monthsFull.map((m, i) => (
            <SelectItem key={i} value={i.toString()}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={currentMonth.getFullYear().toString()} onValueChange={handleYearChange}>
        <SelectTrigger className="h-8 w-[90px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("[&.rdp]:border-0", className)}
      month={currentMonth}
      onMonthChange={setCurrentMonth}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 border border-[var(--color-gray)] rounded-lg p-3",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium hidden",
        nav: "space-x-1 flex items-center hidden",
        nav_button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute left-1"
        ),
        nav_button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute right-1"
        ),
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-gray-900 rounded-md w-9 font-light text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-50 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-light aria-selected:opacity-100 text-gray-900"
        ),
        day_range_end: "day-range-end",
        day_selected: "bg-gradient-to-br from-[var(--gradient-top-left)] to-[var(--gradient-top-right)] text-white hover:opacity-90 focus:opacity-90",
        day_today: "bg-blue-50 text-[var(--color-accent)]",
        day_outside: "day-outside text-gray-300 opacity-50 aria-selected:bg-blue-50 aria-selected:text-gray-300 aria-selected:opacity-30",
        day_disabled: "text-gray-300 opacity-50",
        day_range_middle: "aria-selected:bg-blue-50 aria-selected:text-[var(--color-accent)]",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Caption: CustomCaption as any,
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
