"use client";
import { GripVertical, MessageCircle } from "lucide-react";

export function TaskPending({ text }) {
  return (
    <div className="flex items-center justify-start border-b border-text-light-color w-full h-[42px] transition-all duration-150 ease-in-out text-normal px-5 opacity-50 blur-[0.4px]">
      <div>
        <input type="checkbox" name="task" id="task" />
      </div>

      <div className="min-w-5 max-w-5 ml-1.5 text-text-light-color">
        <GripVertical size={16} />
      </div>

      <div className="p-1.5 w-full min-w-[200px] max-w-[700px]">
        <span className="block overflow-hidden whitespace-nowrap text-ellipsis">{text}</span>
      </div>

      <div className="flex items-center justify-center text-text-color-muted min-w-[41px] max-w-[41px] border-r border-text-light-color h-full">
        <MessageCircle size={24} fillOpacity={0} />
      </div>
    </div>
  );
}
