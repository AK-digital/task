"use client";
import { sendFeedback } from "@/actions/feedback";
import { CheckCircle, MessageCircle, Star } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

const initialState = {
  success: null,
  message: "",
  errors: null,
};

export default function Feedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [rating, setRating] = useState(null);
  const [message, setMessage] = useState("");
  const [hoverRating, setHoverRating] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSuccessAnimation, setIsSuccessAnimation] = useState(false);

  const sendFeedbackWithId = sendFeedback.bind(null, rating);
  const [state, formAction, pending] = useActionState(
    sendFeedbackWithId,
    initialState
  );

  console.log(state);

  function handleRating(rating) {
    resetStars();
    setRating(rating);
    setHoverRating(false);
    const stars = document.getElementsByClassName("star");
    for (let i = 0; i < stars.length; i++) {
      if (i < rating) {
        fillStar(stars[i]);
      }
    }
  }

  function fillStar(star) {
    star.classList.add("fill-accent-color-light");
    star.classList.add("text-accent-color-light");
  }

  function resetStars() {
    const stars = document.getElementsByClassName("star");

    for (let i = 0; i < stars.length; i++) {
      stars[i].classList.remove("fill-accent-color-light");
      stars[i].classList.remove("text-accent-color-light");
    }
  }

  function handleClose(e) {
    e.preventDefault();
    setIsClosing(true);
    const timeout = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      setRating(null);
      setMessage("");
      resetStars();
      state.errors = null;
    }, 250);

    return () => clearTimeout(timeout);
  }

  function getErrMsg(error) {
    return state.errors?.[error];
  }

  function hoverStars(rating) {
    const stars = document.getElementsByClassName("star");
    for (let i = 0; i < stars.length; i++) {
      if (i < rating) {
        fillStar(stars[i]);
      }
    }
  }

  function resetHoverStars() {
    if (!hoverRating) return;
    const stars = document.getElementsByClassName("star");
    for (let i = 0; i < stars.length; i++) {
      stars[i].classList.remove("fill-accent-color-light");
      stars[i].classList.remove("text-accent-color-light");
    }
  }
  useEffect(() => {
    if (state.success) {
      setRating(null);
      setMessage("");
      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccessAnimation(true);

        // Attendre que l'animation soit terminée (350ms) puis fermer
        setTimeout(() => {
          setIsOpen(false);
          setIsSuccess(false);
          setIsSuccessAnimation(false);
          resetStars();
        }, 350); // Durée de l'animation success-animation
      }, 650);
    }
  }, [state]);

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
        <div
          className={`bg-white p-4 rounded-lg shadow-lg max-w-[500px] ${
            isClosing ? "feedback-animation-close" : "feedback-animation"
          } ${isSuccessAnimation ? "feedback-success" : ""}`}
        >
          {isSuccess ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <CheckCircle size={24} className="text-green-700" />
              <span className="text-green-700 text-md font-medium">
                Feedback envoyé avec succès
              </span>
            </div>
          ) : (
            <>
              <span className="block text-2xl font-bold mb-0.5">Feedback</span>
              <p className="text-gray-400/80 text-sm font-medium mb-2">
                Nhésitez pas à nous faire part de vos suggestions !
              </p>
              <div className="flex justify-between gap-2 bg-gray-100/80 rounded-lg p-4 mb-2">
                <Star
                  size={38}
                  className="star cursor-pointer"
                  onClick={() => handleRating(1)}
                  onMouseEnter={() => hoverStars(1)}
                  onMouseLeave={resetHoverStars}
                />
                <Star
                  size={38}
                  className="star cursor-pointer"
                  onClick={() => handleRating(2)}
                  onMouseEnter={() => hoverStars(2)}
                  onMouseLeave={resetHoverStars}
                />
                <Star
                  size={38}
                  className="star cursor-pointer"
                  onClick={() => handleRating(3)}
                  onMouseEnter={() => hoverStars(3)}
                  onMouseLeave={resetHoverStars}
                />
                <Star
                  size={38}
                  className="star cursor-pointer"
                  onClick={() => handleRating(4)}
                  onMouseEnter={() => hoverStars(4)}
                  onMouseLeave={resetHoverStars}
                />
                <Star
                  size={38}
                  className="star cursor-pointer"
                  onClick={() => handleRating(5)}
                  onMouseEnter={() => hoverStars(5)}
                  onMouseLeave={resetHoverStars}
                />
              </div>
              {getErrMsg("note") && (
                <i className="text-red-500 text-sm font-medium mb-2">
                  {getErrMsg("note")}
                </i>
              )}
              <form action={formAction} className="w-full gap-0">
                <div className="relative w-full">
                  <span className="block text-gray-400/80 text-sm font-medium mb-1">
                    Partagez votre expérience
                  </span>
                  <textarea
                    className="w-full h-48 p-2 border-2 rounded-lg border-gray-300 resize-none focus:border-accent-color/50 transition-all duration-300 ease-in-out"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="message"
                    name="message"
                    required
                    minLength={1}
                    maxLength={1200}
                    placeholder="Votre feedback..."
                  />
                  <span className="absolute bottom-2 right-2 text-gray-400/80 text-sm font-medium">
                    {message?.length}/1200
                  </span>
                </div>
                {getErrMsg("message") && (
                  <i className="text-red-500 text-sm font-medium mb-2">
                    {getErrMsg("message")}
                  </i>
                )}
                <div className="flex gap-3 w-full">
                  <button
                    className="text-text-darker-color flex-1/2 w-full mt-2 rounded-lg  bg-transparent border-[2px] border-gray-300 shadow-none hover:bg-gray-100 transition-all duration-300 ease-in-out"
                    onClick={handleClose}
                  >
                    Annuler
                  </button>
                  <button
                    className="w-full mt-2 rounded-lg"
                    data-disabled={message?.length === 0}
                    disabled={pending || message?.length === 0}
                  >
                    Envoyer
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
