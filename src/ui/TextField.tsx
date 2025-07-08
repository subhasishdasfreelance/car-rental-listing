"use client";

import type { ChangeEvent } from "react";
import {
	TextField as AriaTextField,
	Input,
	TextArea,
	Label,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";

type Props = {
	className?: string;
	label?: string;
	value: string | number | readonly string[];
	onChange: (
		event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => void;
	rows?: number;
	placeholder?: string;
	inputAreaClassName?: string;
	type?: string;
};

export default function TextField({
	className,
	label,
	value,
	onChange,
	rows,
	placeholder,
	inputAreaClassName,
	type
}: Props) {
	return (
		<AriaTextField className={twMerge("flex flex-col gap-1", className)}>
			{label && <Label className="font-medium">{label}</Label>}
			{rows && rows > 1 ? (
				<TextArea
					value={value}
					onChange={onChange}
					className={`border border-black/10 px-4 py-2 rounded-xl bg-pry/10 hover:border-black/30 focus:border-black/60 outline-none ease-out duration-200 ${inputAreaClassName}`}
					rows={rows}
					placeholder={placeholder}
				/>
			) : (
				<Input
					value={value}
					onChange={onChange}
					className={`border border-black/10 px-4 py-2 rounded-xl bg-pry/10 hover:border-black/30 focus:border-black/60 outline-none ease-out duration-200 ${inputAreaClassName}`}
					placeholder={placeholder}
					type={type}
				/>
			)}
		</AriaTextField>
	);
}
