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
          "relative bg-pry text-white backdrop-blur-md border border-white/10",
        clear:
          "border border-black/30 data-[hovered]:border-black/30 data-[pressed]:border-black/60 outline-none ease-out duration-200 px-3 py-1 bg-transparent",
        danger: "border border-red-500/50 data-[hovered]:border-red-500/50 data-[pressed]:border-red-500/80 outline-none ease-out duration-200 px-3 py-1 bg-transparent text-red-500"
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
            intent={intent === "clear" ? undefined : intent}
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
            intent={intent === "clear" ? undefined : intent}
          />
        </>
      )}
    </Button>
  );
};
