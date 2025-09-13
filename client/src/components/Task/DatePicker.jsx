"use client";
import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import "moment/locale/fr";

export default function DatePicker({ value, onChange, onClose, isOpen }) {
  const [currentDate, setCurrentDate] = useState(moment());
  const [selectedDate, setSelectedDate] = useState(value ? moment(value) : null);
  const [showAbove, setShowAbove] = useState(false);
  const pickerRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const date = moment(value);
      setSelectedDate(date);
      setCurrentDate(date.clone().startOf('month'));
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    }

    function calculatePosition() {
      if (isOpen && pickerRef.current) {
        // Utiliser un timeout pour s'assurer que le DOM est rendu
        setTimeout(() => {
          if (pickerRef.current && pickerRef.current.parentElement) {
            const rect = pickerRef.current.parentElement.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const pickerHeight = 350; // Hauteur approximative du datepicker
            const spaceBelow = viewportHeight - rect.bottom - 10; // Marge de sécurité
            const spaceAbove = rect.top - 10; // Marge de sécurité

            // Si pas assez de place en bas mais assez en haut, afficher au-dessus
            if (spaceBelow < pickerHeight && spaceAbove > pickerHeight) {
              setShowAbove(true);
            } else {
              setShowAbove(false);
            }
          }
        }, 0);
      }
    }

    if (isOpen) {
      calculatePosition();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', calculatePosition);
      window.addEventListener('resize', calculatePosition);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', calculatePosition);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isOpen, onClose]);

  const getDaysInMonth = () => {
    const startOfMonth = currentDate.clone().startOf('month');
    const endOfMonth = currentDate.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days = [];
    const current = startDate.clone();

    while (current.isSameOrBefore(endDate)) {
      days.push(current.clone());
      current.add(1, 'day');
    }

    return days;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    onChange(date.format('YYYY-MM-DD'));
    onClose();
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => prev.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => prev.clone().add(1, 'month'));
  };

  const handleToday = () => {
    const today = moment();
    setSelectedDate(today);
    onChange(today.format('YYYY-MM-DD'));
    onClose();
  };

  if (!isOpen) return null;

  const days = getDaysInMonth();
  const today = moment();

  return (
    <div 
      ref={pickerRef}
      className={`datepicker-container absolute left-0 bg-secondary border border-gray-200 rounded-lg shadow-lg z-[9999] p-3 min-w-[280px] max-w-[320px] sm:min-w-[300px] ${
        showAbove 
          ? 'bottom-full mb-1' 
          : 'top-full mt-1'
      }`}
      data-datepicker
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span
          onClick={handlePrevMonth}
          className="p-1 border border-gray-200 hover:bg-gray-100 rounded"
          type="button"
        >
          <ChevronLeft size={16} />
        </span>
        <h3 className="font-medium text-sm select-none">
          {currentDate.format('MMMM YYYY')}
        </h3>
        <span
          onClick={handleNextMonth}
          className="p-1 border border-gray-200 hover:bg-gray-100 rounded"
          type="button"
        >
          <ChevronRight size={16} />
        </span>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2 select-none">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
          <div key={index} className="text-xs text-gray-500 text-center py-1 font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((day, index) => {
          const isCurrentMonth = day.month() === currentDate.month();
          const isSelected = selectedDate && day.isSame(selectedDate, 'day');
          const isToday = day.isSame(today, 'day');
          const isPast = day.isBefore(today, 'day');

          return (
            <span
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                text-xs p-1.5 select-none rounded border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : 'text-gray-700'}
                ${isSelected ? 'bg-accent-color text-white hover:bg-accent-color' : ''}
                ${isToday && !isSelected ? 'bg-blue-100' : ''}
                ${isPast && !isSelected && !isToday ? 'text-gray-400' : ''}
              `}
              type="button"
            >
              {day.date()}
            </span>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 pt-2 border-t justify-between border-gray-100">
        <span
          onClick={handleToday}
          className="text-xs px-2 py-1 border border-accent-color text-accent-color hover:bg-accent-color hover:text-white rounded transition-colors"
          type="button"
        >
          Aujourd'hui
        </span>
        <span
          onClick={onClose}
          className="text-xs px-2 py-1 border border-gray-400 text-gray-500 hover:bg-gray-500 hover:text-white rounded transition-colors"
          type="button"
        >
          Annuler
        </span>
      </div>
    </div>
  );
}
