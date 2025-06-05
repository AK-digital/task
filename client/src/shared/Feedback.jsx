"use client";
import { MessageCircle } from "lucide-react";
import { useState } from "react";

export default function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-10 z-2000">
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="bg-accent-color p-2 flex items-center justify-center gap-1  rounded-full shadow-md cursor-pointer hover:bg-accent-color/90 transition-all duration-300"
        >
          <MessageCircle size={24} color="white" className="scale-x-[-1]" />
          <span className="text-white text-sm font-medium">Feedback</span>
        </div>
      )}
      {isOpen && (
        <div className="bg-white p-4 rounded-lg shadow-lg max-w-[400px]">
          <span className="text-lg font-medium text-center m-auto block mb-2">
            Merci de nous aider à améliorer Clynt !
          </span>
          <textarea
            className="w-full h-96 p-2 rounded-md border border-gray-300"
            placeholder="Votre feedback..."
          />
          <button className="w-full mt-2 rounded-md">Envoyer</button>
        </div>
      )}
    </div>
  );
}
