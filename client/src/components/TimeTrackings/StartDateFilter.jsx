"use client";
import { firstDayOfTheMonth } from "@/utils/date";
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "../Task/DatePicker";
import moment from "moment";
import "moment/locale/fr";

export default function StartDateFilter({ queries, setQueries }) {
  const [startDate, setStartDate] = useState(queries?.startingDate || "");
  const [isOpen, setIsOpen] = useState(false);

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

  function handleStartDateChange(dateString) {
    setStartDate(dateString);

    setQueries((prev) => ({
      ...prev,
      startingDate: dateString,
    }));
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Date de début";
    const date = moment(dateString);
    return date.format("DD/MM/YYYY");
  };

  return (
    <div className="relative">
      <div 
        className="secondary-button cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={16} />
        <span className="text-[14px]">
          {formatDisplayDate(startDate)}
        </span>
      </div>
      
      <DatePicker
        value={startDate}
        onChange={handleStartDateChange}
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      />
    </div>
  );
}
