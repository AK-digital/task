"use client";
import { firstDayOfTheMonth } from "@/utils/date";
import React, { useEffect, useState } from "react";

export default function StartDateFilter({ queries, setQueries }) {
  const [startDate, setStartDate] = useState(queries?.startingDate || "");

  // If no starting date, set it to the first day of the month
  useEffect(() => {
    if (!queries?.startingDate) {
      setStartDate(firstDayOfTheMonth);

      setQueries((prev) => ({
        ...prev,
        startingDate: firstDayOfTheMonth,
      }));
    }
  }, []);

  function handleStartDateChange(e) {
    setStartDate(e.target.value);

    setQueries((prev) => ({
      ...prev,
      startingDate: e.target.value,
    }));
  }

  return (
    <div className="flex items-center justify-center gap-1 p-2.5 rounded-sm bg-secondary cursor-pointer text-medium w-[180px] max-h-10 border border-color-border-color">
      <input
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
        className="border-b-0 cursor-pointer text-[15px]"
      />
    </div>
  );
}
