"use client";

import { UIAnimationDuration } from "@/constant";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import {
	Disclosure as AriaDisclosure,
	Button,
	Heading,
} from "react-aria-components";

gsap.registerPlugin(useGSAP);

type Props = {
	label: string;
	content: React.ReactNode;
	className?: string;
	isExpanded: boolean;
	setIsExpanded: () => void;
};

export default function Disclosure({
	label,
	content,
	className,
	isExpanded,
	setIsExpanded,
}: Props) {
	const panelRef = useRef<HTMLDivElement>(null);

	useGSAP(
		() => {
			if (!panelRef.current) return;

			if (isExpanded) {
				panelRef.current.style.display = "block";
				gsap.fromTo(
					panelRef.current,
					{ height: 0 },
					{
						height: "auto",
						duration: UIAnimationDuration,
						ease: "power2.out",
						clearProps: "height",
					},
				);
			} else {
				gsap.to(panelRef.current, {
					height: 0,
					duration: UIAnimationDuration,
					ease: "power1.in",
					onComplete: () => {
						if (panelRef.current) panelRef.current.style.display = "none";
					},
				});
			}
		},
		{ dependencies: [isExpanded] },
	);

	return (
		<AriaDisclosure
			isExpanded={isExpanded}
			onExpandedChange={setIsExpanded}
			className={`border border-white/30 rounded-3xl py-3 w-full ${className}`}
		>
			<Heading className="px-6">
				<Button
					slot="trigger"
					className="cursor-pointer flex gap-1 items-center-safe justify-between w-full font-bold"
				>
					{label}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
						className={`size-4 mt-[1px] duration-150 ease-out ${
							isExpanded ? "rotate-180" : ""
						}`}
					>
						<title>arrow</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m19.5 8.25-7.5 7.5-7.5-7.5"
						/>
					</svg>
				</Button>
			</Heading>

			{/* Animated panel (not using DisclosurePanel) */}
			<div
				ref={panelRef}
				style={{ display: "none", overflow: "hidden" }}
				className="mt-2 pt-2 px-6"
			>
				{content}
			</div>
		</AriaDisclosure>
	);
}
