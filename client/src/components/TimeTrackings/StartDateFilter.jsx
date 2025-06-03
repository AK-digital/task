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
    <div>
      <input type="date" value={startDate} onChange={handleStartDateChange} />
    </div>
  );
}
