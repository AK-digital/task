import { lastDayOfTheMonth } from "@/utils/date";
import React, { useEffect, useState } from "react";

export default function EndDateFilter({ queries, setQueries }) {
  const [endDate, setEndDate] = useState(queries?.endingDate);

  // If no ending date, set it to the last day of the month
  useEffect(() => {
    if (!queries?.endingDate) {
      setQueries((prev) => ({
        ...prev,
        endingDate: lastDayOfTheMonth,
      }));

      setEndDate(lastDayOfTheMonth);
    }
  }, []);

  function handleEndDateChange(e) {
    setEndDate(e.target.value);
    setQueries((prev) => ({
      ...prev,
      endingDate: e.target.value,
    }));
  }

  return (
    <div className="flex items-center justify-center gap-1 p-2.5 rounded-sm bg-secondary cursor-pointer text-medium w-[180px] max-h-10 border border-color-border-color">
      <input
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        className="border-b-0 cursor-pointer"
      />
    </div>
  );
}
