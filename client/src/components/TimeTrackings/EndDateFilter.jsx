import { lastDayOfTheMonth } from "@/utils/date";
import React, { useEffect, useState } from "react";

export default function EndDateFilter({ queries, setQueries }) {
  const [endDate, setEndDate] = useState(queries?.endingDate || "");

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
    <div className="secondary-button">
      <input
        type="date"
        value={endDate}
        onChange={handleEndDateChange}
        className="p-0 border-0 bg-transparent cursor-pointer text-[14px] outline-none"
      />
    </div>
  );
}
