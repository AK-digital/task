import React from "react";

export default function TimeTrackingsSkeletons() {
  return (
    <div>
      {Array.from({ length: 16 }).map((_, idx) => {
        return (
          <div
            key={idx}
            className="flex items-center bg-secondary border-b border-text-light-color text-normal h-[42px] animate-pulse"
          >
            {/* Element selection */}
            <div className="flex justify-center items-center min-w-10 max-w-10 gap-1 w-full h-full cursor-default"></div>
            {/* Task text */}
            <div className="flex items-center gap-4 w-full min-w-[200px] max-w-[700px] cursor-text">
              <span className="overflow-hidden whitespace-nowrap text-ellipsis w-3.5 h-3.5 rounded-sm bg-primary"></span>
              <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-1/2 h-3.5 rounded-sm bg-primary"></span>
            </div>
            <div className="flex justify-center items-center gap-1 w-full h-full cursor-default min-w-[150px] max-w-[150px] border-l border-text-light-color px-4">
              <div className="rounded-full"></div>
              <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-full max-w-[700px] h-4.5 rounded-sm bg-primary"></span>
            </div>
            {/* user */}
            <div className="flex justify-center items-center gap-1 w-full h-full cursor-default min-w-[150px] max-w-[150px] border-l border-r border-text-light-color ">
              <div className="rounded-full"></div>
              <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-1/2 max-w-[180px] h-4.5 rounded-sm bg-primary"></span>
            </div>
            <div className="flex justify-center items-center gap-1 w-full h-full cursor-default max-w-[120px] border-r border-text-light-color">
              <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-1/2 max-w-[120px] h-4.5 rounded-sm bg-primary"></span>
            </div>
            {/* Duration */}
            <div className="flex justify-center items-center gap-1 w-full h-full cursor-default max-w-[100px] border-r border-text-light-color ">
              <span className="block overflow-hidden whitespace-nowrap text-ellipsis w-1/2 max-w-[100px] h-4.5 rounded-sm bg-primary"></span>
            </div>
            {/* Billable */}
            <div className="relative flex justify-center items-center gap-1 h-full max-w-[120px] border-r border-text-light-color text-text-color-muted cursor-pointer px-6">
              <div className="w-5 h-5 rounded-full bg-primary"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
