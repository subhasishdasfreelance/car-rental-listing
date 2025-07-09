import { type VariantProps, cva } from "class-variance-authority";
import type { FC, SVGProps } from "react";
import { twMerge } from "tailwind-merge";

const spinner = cva("animate-spin stroke-current fill-none rounded-full", {
	variants: {
		size: {
			sm: "w-5 h-5",
			normal: "w-6 h-6",
			lg: "w-7 h-7",
		},
		intent: {
			primary: "text-white",
			secondary: "text-gray-500",
			danger: "text-red-500",
		},
	},
	defaultVariants: {
		size: "normal",
		intent: "primary",
	},
});

type SpinnerProps = SVGProps<SVGSVGElement> & VariantProps<typeof spinner>;

export const Spinner: FC<SpinnerProps> = ({
	className,
	size,
	intent,
	...props
}) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			className={twMerge(spinner({ size, intent }), className)}
			{...props}
		>
			<title>spinner</title>
			<path
				d="M20.0001 12C20.0001 13.3811 19.6425 14.7386 18.9623 15.9405C18.282 17.1424 17.3022 18.1477 16.1182 18.8587C14.9341 19.5696 13.5862 19.9619 12.2056 19.9974C10.825 20.0328 9.45873 19.7103 8.23975 19.0612"
				strokeWidth="3.55556"
				strokeLinecap="round"
			/>
		</svg>
	);
};
