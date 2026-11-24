import { useMemo, useState } from "react";
import { IconButton, Input } from "@mui/joy";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import moment from "moment";

interface AppointyDateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  minDate?: string;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const formatTimeSlot = (hhmm: string) => {
  const m = moment(hhmm, "HH:mm");
  return m.isValid() ? m.format("h:mm A") : hhmm;
};

const AppointyDateTimePicker = ({
  date,
  time,
  onDateChange,
  onTimeChange,
  minDate = moment().format("YYYY-MM-DD"),
}: AppointyDateTimePickerProps) => {
  const [viewMonth, setViewMonth] = useState(() =>
    moment(date || minDate, "YYYY-MM-DD").startOf("month"),
  );

  const calendarDays = useMemo(() => {
    const startOfMonth = viewMonth.clone().startOf("month");
    const endOfMonth = viewMonth.clone().endOf("month");
    const startOffset = startOfMonth.day();
    const totalDays = endOfMonth.date();

    const cells: Array<{ dateStr: string; dayNum: number } | null> = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= totalDays; d++) {
      const current = startOfMonth.clone().date(d);
      cells.push({
        dateStr: current.format("YYYY-MM-DD"),
        dayNum: d,
      });
    }
    return cells;
  }, [viewMonth]);

  const todayStr = moment().format("YYYY-MM-DD");
  const canGoPrev = viewMonth
    .clone()
    .subtract(1, "month")
    .endOf("month")
    .isSameOrAfter(moment(minDate, "YYYY-MM-DD"), "day");

  return (
    <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr] gap-4 items-stretch">
      <div className="bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-[#001F54]">
            {viewMonth.format("MMMM YYYY")}
          </span>
          <div className="flex items-center gap-0.5">
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              disabled={!canGoPrev}
              onClick={() =>
                setViewMonth((m) => m.clone().subtract(1, "month"))
              }
              aria-label="Previous month"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={() => setViewMonth((m) => m.clone().add(1, "month"))}
              aria-label="Next month"
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-0.5 text-center mb-1">
          {WEEKDAYS.map((wd) => (
            <span
              key={wd}
              className="text-[10.5px] font-medium uppercase text-[#64748B] py-0.5"
            >
              {wd}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((cell, idx) => {
            if (!cell) return <div key={`empty-${idx}`} />;
            const isDisabled = cell.dateStr < minDate;
            const isSelected = cell.dateStr === date;
            const isToday = cell.dateStr === todayStr;
            return (
              <button
                key={cell.dateStr}
                type="button"
                disabled={isDisabled}
                onClick={() => onDateChange(cell.dateStr)}
                className={`h-8 w-full rounded-md text-xs tabular-nums flex items-center justify-center border-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#001EC5] ${
                  isSelected
                    ? "bg-[#001F54] text-white font-semibold cursor-pointer"
                    : isDisabled
                      ? "text-[#CBD5E1] cursor-not-allowed bg-transparent"
                      : isToday
                        ? "bg-[#E2E8F0]/70 text-[#001F54] font-semibold hover:bg-[#E2E8F0] cursor-pointer"
                        : "bg-transparent text-[#334155] font-medium hover:bg-[#EAEFF5] cursor-pointer"
                }`}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col justify-between gap-3 py-1">
        <div>
          <div className="text-[12.5px] font-semibold text-[#001F54] mb-2">
            {date
              ? moment(date, "YYYY-MM-DD").format("ddd, MMM D")
              : "Available Times"}
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {TIME_SLOTS.filter((slot) => !slot.endsWith(":30")).map((slot) => {
              const selected = time === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onTimeChange(slot)}
                  className={`py-[7px] px-2 rounded-md border text-xs tabular-nums transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#001EC5] ${
                    selected
                      ? "bg-[#EEF2FF] border-[#001EC5] text-[#001EC5] font-semibold"
                      : "bg-white border-[#E5E7EB] text-[#334155] font-medium hover:border-[#CBD5E1] hover:bg-[#F8FAFC]"
                  }`}
                >
                  {formatTimeSlot(slot)}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          size="sm"
          type="time"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AppointyDateTimePicker;
