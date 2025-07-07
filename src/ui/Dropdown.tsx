"use client";

import { UIAnimationDuration } from "@/constant";
import { gsap } from "gsap";
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	Menu,
	MenuItem,
	MenuTrigger,
	Popover,
	type Selection,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { Btn } from "./Btn";

type ControlledDropdownProps = {
	items: { label: string; action: () => void }[];
	label: string;
	selectionMode?: "multiple" | "single";
	selected?: Selection;
	onSelect?: Dispatch<SetStateAction<Selection>>;
	btnClass?: string;
	isOpen: boolean;
	setIsOpen: Dispatch<SetStateAction<boolean>>;
	dropdownID?: string;
};

export function ControlledDropdown({
	items,
	label,
	selectionMode,
	selected,
	onSelect,
	btnClass,
	isOpen,
	setIsOpen,
}: ControlledDropdownProps): ReactNode {
	const popoverRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<gsap.core.Timeline | null>(null);

	// Handle opening animation
	useEffect(() => {
		if (!isOpen || !popoverRef.current) return;

		popoverRef.current.style.display = "block";

		// Kill any existing animations
		animationRef.current?.kill();

		animationRef.current = gsap.timeline().fromTo(
			popoverRef.current,
			{ height: 0 },
			{
				height: "auto",
				duration: UIAnimationDuration,
				ease: "power2.out",
			},
		);
	}, [isOpen]);

	const handleOpenChange = (open: boolean) => {
		console.log("open", open);
		if (open) {
			setIsOpen(true);
		} else {
			// Closing: Animate out first, then update state
			if (popoverRef.current) {
				// Kill existing animations
				animationRef.current?.kill();

				animationRef.current = gsap
					.timeline({
						onComplete: () => {
							if (popoverRef.current) {
								popoverRef.current.style.display = "none";
							}
							console.log("here2");
							setIsOpen(false);
						},
					})
					.to(popoverRef.current, {
						height: 0,
						duration: UIAnimationDuration,
						ease: "power1.in",
					});
			} else {
				console.log("here");
				setIsOpen(false);
			}
		}
	};

	return (
		<MenuTrigger isOpen={!!isOpen} onOpenChange={handleOpenChange}>
			<Btn
				intent="dropdown"
				aria-label="Menu"
				className={twMerge(
					"rounded-full cursor-pointer bg-black/10 backdrop-blur-md",
					btnClass,
				)}
			>
				<span className="flex gap-1 items-center-safe justify-between w-full">
					{label}
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						strokeWidth={2}
						stroke="currentColor"
						className={`size-4 mt-[1px] duration-150 ease-out ${isOpen && "rotate-180"}`}
					>
						<title>arrow</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="m19.5 8.25-7.5 7.5-7.5-7.5"
						/>
					</svg>
				</span>
			</Btn>
			<Popover
				ref={popoverRef}
				className="overflow-hidden shadow-xl bg-black/50 backdrop-blur-md rounded-xl border border-white/30 pointer-events-auto"
				style={{ display: "none" }} // Initially hidden
			>
				<Menu
					selectionMode={selectionMode}
					selectedKeys={selected}
					onSelectionChange={onSelect}
				>
					{items.map((item) => (
						<MenuItem
							key={item.label}
							onAction={() => item.action()}
							className="cursor-pointer hover:bg-white/20 px-3 py-2"
						>
							{item.label}
						</MenuItem>
					))}
				</Menu>
			</Popover>
		</MenuTrigger>
	);
}

type Props = Omit<ControlledDropdownProps, "isOpen" | "setIsOpen">;

export default function Dropdown(props: Props) {
	const [isOpen, setIsOpen] = useState<boolean>(false);

	return (
		<ControlledDropdown isOpen={isOpen} setIsOpen={setIsOpen} {...props} />
	);
}
