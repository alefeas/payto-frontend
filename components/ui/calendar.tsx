"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, ...props }: CalendarProps) {
  const [month, setMonth] = React.useState(new Date())
  const [monthValue, setMonthValue] = React.useState(String(new Date().getMonth()))
  const [yearValue, setYearValue] = React.useState(String(new Date().getFullYear()))

  // Filtrar props que no queremos que pisen nuestro estado
  const safeProps = { ...props }
  delete (safeProps as any).month
  delete (safeProps as any).onMonthChange

  const years = Array.from({ length: 131 }, (_, i) => 1920 + i)
  const monthsES = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: monthsES[i],
  }))

  const handleMonthChange = (value: string) => {
    setMonthValue(value)
    const newMonth = new Date(parseInt(yearValue), parseInt(value), 1)
    setMonth(newMonth)
  }

  const handleYearChange = (value: string) => {
    setYearValue(value)
    const newMonth = new Date(parseInt(value), parseInt(monthValue), 1)
    setMonth(newMonth)
  }

  const goPrev = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1)
    setMonth(newMonth)
    setMonthValue(String(newMonth.getMonth()))
    setYearValue(String(newMonth.getFullYear()))
  }

  const goNext = () => {
    const newMonth = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    setMonth(newMonth)
    setMonthValue(String(newMonth.getMonth()))
    setYearValue(String(newMonth.getFullYear()))
  }

  return (
    <div
      className={cn(
        "space-y-3 border border-[var(--color-gray)] rounded-lg p-4 w-fit mx-auto",
        className
      )}
    >
      {/* HEADER CON SELECTS FUNCIONALES */}
      <div className="flex items-center justify-center gap-2">
        {/* SELECT del MES */}
        <Select value={monthValue} onValueChange={handleMonthChange}>
          <SelectTrigger className="w-24 h-9">
            <SelectValue placeholder="Mes" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SELECT del AÑO */}
        <Select value={yearValue} onValueChange={handleYearChange}>
          <SelectTrigger className="w-20 h-9">
            <SelectValue placeholder="Año" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* CALENDARIO QUE ESCUCHA EL ESTADO */}
      <div className="flex justify-center">
        <DayPicker
          {...safeProps}
          month={month}
          onMonthChange={setMonth}
          showOutsideDays
          className="p-0"
          classNames={{
            months: "flex flex-col space-y-4",
            month: "space-y-4",
            caption: "hidden",
            nav: "hidden",
            table: "w-fit border-collapse space-y-1",
            head_row: "flex justify-center",
            head_cell:
              "text-gray-900 rounded-md w-8 h-8 font-light text-[0.8rem] flex items-center justify-center",
            row: "flex justify-center mt-2 gap-1",
            cell: "h-8 w-8 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-blue-50 [&:has([aria-selected])]:bg-blue-50 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
            day: "h-8 w-8 p-0 font-light aria-selected:opacity-100 text-gray-900 flex items-center justify-center rounded-md hover:bg-blue-100 cursor-pointer transition-colors",
            day_range_end: "day-range-end",
            day_selected:
              "bg-gradient-to-br from-[var(--gradient-top-left)] to-[var(--gradient-top-right)] text-white hover:opacity-90 focus:opacity-90",
            day_today: "bg-blue-50 text-[var(--color-accent)] rounded-md",
            day_outside:
              "day-outside text-gray-300 opacity-50 aria-selected:bg-blue-50 aria-selected:text-gray-300 aria-selected:opacity-30",
            day_disabled: "text-gray-300 opacity-50",
            day_range_middle:
              "aria-selected:bg-blue-50 aria-selected:text-[var(--color-accent)]",
            day_hidden: "invisible",
            ...classNames,
          }}
        />
      </div>
    </div>
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
