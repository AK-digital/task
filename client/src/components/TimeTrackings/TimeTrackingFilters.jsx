"use client";
import { useState, useEffect } from "react";
import { Calendar, Users } from "lucide-react";
import { useProjectContext } from "@/context/ProjectContext";
import DisplayPicture from "../User/DisplayPicture";

export default function TimeTrackingFilters({ queries, setQueries }) {
  const { project } = useProjectContext();
  const [startDate, setStartDate] = useState(queries?.startDate || "");
  const [endDate, setEndDate] = useState(queries?.endDate || "");
  const [selectedMembers, setSelectedMembers] = useState(queries?.members || []);
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);

  const members = project?.members || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMemberDropdown && !event.target.closest('.member-filter-dropdown')) {
        setShowMemberDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMemberDropdown]);

  useEffect(() => {
    const newQueries = {
      ...queries,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(selectedMembers.length > 0 && { members: selectedMembers }),
    };
    
    // Remove empty filters
    if (!startDate) delete newQueries.startDate;
    if (!endDate) delete newQueries.endDate;
    if (selectedMembers.length === 0) delete newQueries.members;
    
    setQueries(newQueries);
  }, [startDate, endDate, selectedMembers]);

  const handleMemberToggle = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedMembers([]);
  };

  const hasActiveFilters = startDate || endDate || selectedMembers.length > 0;

  return (
    <div className="flex items-center gap-3">
      {/* Date filters */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Calendar size={16} className="text-gray-500" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-2 py-1 text-sm border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-accent-color"
            placeholder="Date début"
          />
        </div>
        <span className="text-gray-400">à</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="px-2 py-1 text-sm border border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-accent-color"
          placeholder="Date fin"
        />
      </div>

      {/* Member filter */}
      <div className="relative member-filter-dropdown">
        <button
          onClick={() => setShowMemberDropdown(!showMemberDropdown)}
          className={`secondary-button gap-2 px-3 py-1 text-sm transition-colors ${
            selectedMembers.length > 0
              ? 'border-accent-color text-accent-color'
              : ''
          }`}
        >
          <Users size={16} />
          <span>
            {selectedMembers.length === 0 
              ? 'Tous les membres' 
              : `${selectedMembers.length} membre${selectedMembers.length > 1 ? 's' : ''}`
            }
          </span>
        </button>

        {showMemberDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px] z-50">
            <div className="py-2">
              {members.map((member, index) => (
                <label
                  key={member.user?._id || `member-${index}`}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.user?._id)}
                    onChange={() => handleMemberToggle(member.user?._id)}
                  />
                  <DisplayPicture
                    user={member.user}
                    style={{ width: "24px", height: "24px" }}
                    className="rounded-full flex-shrink-0"
                  />
                  <span className="text-sm">
                    {member.user?.firstName} {member.user?.lastName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="secondary-button text-sm px-3 py-1"
        >
          Effacer
        </button>
      )}
    </div>
  );
}
