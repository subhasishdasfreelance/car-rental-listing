"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { type ReactNode, type Ref, useEffect, useState } from "react";
import {
  type ButtonProps as AriaButtonProps,
  Button,
  type PressEvent,
  composeRenderProps,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { Spinner } from "./Spinner";

const buttonVariants = cva(
  "inline-flex items-center justify-center transition-transform duration-150 ease-out data-[disabled]:opacity-50 disabled:pointer-events-none transform data-[hovered]:scale-103 data-[pressed]:scale-97 cursor-pointer rounded-full font-bold",
  {
    variants: {
      intent: {
        primary:
          "relative bg-gradient-to-r from-[var(--pry)]/30 to-[var(--sec)]/30 text-white backdrop-blur-md border border-white/10 after:content-[''] after:absolute after:-inset-1 after:rounded-full after:bg-gradient-to-r after:from-pry after:to-sec after:blur-md after:opacity-70 after:z-[-1] after:mix-blend-overlay shadow-[inset_0_0_8px_2px_rgba(255,255,255,0.1),_inset_0_0_8px_1px_rgba(255,255,255,0.1)]",
        dropdown:
          "border border-white/30 data-[hovered]:border-white/30 data-[pressed]:border-white/60 outline-none ease-out duration-200 px-3 py-1 bg-black/30",
      },
      size: {
        sm: "py-1 md:py-1.5 px-3 text-sm",
        normal: "py-1.5 md:py-2 px-4 text-base",
        lg: "py-2 md:py-2.5 px-5 text-lg",
      },
    },
    // compoundVariants: [
    // 	{
    // 		intent: "primary",
    // 		size: "normal",
    // 		class: "uppercase tracking-wider",
    // 	},
    // ],
    defaultVariants: {
      intent: "primary",
      size: "normal",
    },
  }
);

interface ButtonProps
  extends AriaButtonProps,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  isLoading?: boolean;
  ref?: Ref<HTMLButtonElement>;
  spinnerRight?: boolean;
}

export const Btn = ({
  className,
  intent,
  size,
  children,
  isLoading,
  onPress,
  isDisabled,
  spinnerRight = false,
  ...props
}: ButtonProps) => {
  const [shouldShowSpinner, setShouldShowSpinner] = useState(isLoading);
  useEffect(() => {
    setShouldShowSpinner(isLoading);
    return () => setShouldShowSpinner(false);
  }, [isLoading]);

  const handleClick = async (e: PressEvent) => {
    if (shouldShowSpinner) return;
    if (!onPress) return;

    setShouldShowSpinner(true);
    await onPress(e);
    setShouldShowSpinner(false);
  };

  return (
    <Button
      onPress={handleClick}
      isDisabled={isDisabled}
      className={composeRenderProps(className, (className) =>
        twMerge(
          buttonVariants({
            intent,
            size,
            className,
          })
        )
      )}
      {...props}
    >
      {shouldShowSpinner && !spinnerRight && (
        <>
          <Spinner
            size={size}
            intent={intent === "dropdown" ? undefined : intent}
          />
          &nbsp;
        </>
      )}
      {children}
      {shouldShowSpinner && spinnerRight && (
        <>
          &nbsp;
          <Spinner
            size={size}
            intent={intent === "dropdown" ? undefined : intent}
          />
        </>
      )}
    </Button>
  );
};
