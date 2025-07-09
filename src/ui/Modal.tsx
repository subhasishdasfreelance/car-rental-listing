import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { UIAnimationDuration } from "@/constant/ui";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  header: string;
  success?: boolean;
};

export default function Modal({
  isOpen,
  onClose,
  header,
  success,
  children,
}: ModalProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  const { contextSafe } = useGSAP(
    () => {
      if (isOpen && innerRef.current) {
        gsap.fromTo(
          innerRef.current,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, UIAnimationDuration, ease: "power1.out" }
        );
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, UIAnimationDuration, ease: "power1.out" }
        );
      }
    },
    { scope: portalRef, dependencies: [isOpen] }
  );

  const closeModal = contextSafe(() => {
    if (!isOpen) return;

    gsap.to(innerRef.current, {
      scale: 0.8,
      opacity: 0,
      UIAnimationDuration,
      ease: "power1.in",
      onComplete: onClose,
    });
    gsap.to(overlayRef.current, {
      opacity: 0,
      UIAnimationDuration,
      ease: "power1.in",
      onComplete: onClose,
    });
  });

  if (!isOpen) return null;

  return createPortal(
    <div ref={portalRef}>
      <div
        ref={overlayRef}
        className="fixed inset-0 flex items-center justify-center bg-white/50 backdrop-blur-md z-[9999]"
        role="dialog"
        aria-modal="true"
        onClick={closeModal}
      >
        <div
          ref={innerRef}
          className="bg-white/50 border border-black/30 p-4 rounded-xl w-full max-w-md mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xl font-bold mb-2 flex items-center">
            {success ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="green"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="red"
                className="size-6"
              >
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            &nbsp;{header}
          </p>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById("modal-portal")!
  );
}
