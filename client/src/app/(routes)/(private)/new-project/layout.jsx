"use client";

export default function NewProjectLayout({ children }) {
  return (
    <div className="h-screen w-screen bg-primary flex flex-col overflow-hidden">
      <div className="w-full h-full bg-primary flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
} 