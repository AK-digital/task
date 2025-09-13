"use client";
import { lastDayOfTheMonth } from "@/utils/date";
import React, { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import DatePicker from "../Task/DatePicker";
import moment from "moment";
import "moment/locale/fr";

export default function EndDateFilter({ queries, setQueries }) {
  const [endDate, setEndDate] = useState(queries?.endingDate || "");
  const [isOpen, setIsOpen] = useState(false);

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

  function handleEndDateChange(dateString) {
    setEndDate(dateString);
    setQueries((prev) => ({
      ...prev,
      endingDate: dateString,
    }));
  }

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "Date de fin";
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
          {formatDisplayDate(endDate)}
        </span>
      </div>
      
      <DatePicker
        value={endDate}
        onChange={handleEndDateChange}
        onClose={() => setIsOpen(false)}
        isOpen={isOpen}
      />
    </div>
  );
}
