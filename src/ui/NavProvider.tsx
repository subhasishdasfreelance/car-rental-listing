"use client";

import { UIAnimationDuration } from "@/constant/ui";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import Link from "next/link";
import {
  type ReactNode,
  type RefObject,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";
import { Button } from "react-aria-components";
import { useOnClickOutside } from "usehooks-ts";

const navMenus = ["Menu1", "Menu2"];

gsap.registerPlugin(useGSAP, ScrollTrigger);

const NavContext = createContext<{
  openSidebar: () => void;
  closeSidebar: () => void;
}>({ openSidebar: () => {}, closeSidebar: () => {} });

type Props = {
  children: ReactNode;
};

export function NavProvider({ children }: Props) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const GSAPContainer = useRef<HTMLDivElement>(null);
  const smoothScrollContainer = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { contextSafe } = useGSAP(
    () => {
      if (!GSAPContainer.current) return;
    },
    { scope: GSAPContainer }
  );

  const openSidebar = contextSafe(() => {
    if (isSidebarOpen) return;

    setIsSidebarOpen(true);
    gsap.to(sidebarRef.current, { duration: UIAnimationDuration, x: "18rem" });
    gsap.fromTo(
      overlayRef.current,
      { duration: UIAnimationDuration, opacity: "100%" },
      { duration: UIAnimationDuration, opacity: "30%" }
    );
  });

  const closeSidebar = contextSafe(() => {
    if (!isSidebarOpen) return;

    setIsSidebarOpen(false);
    gsap.to(sidebarRef.current, { duration: UIAnimationDuration, x: "0" });
    gsap.fromTo(
      overlayRef.current,
      {
        duration: UIAnimationDuration,
        background: "#ffff0000",
        opacity: "30%",
      },
      {
        duration: UIAnimationDuration,
        background: "#00000000",
        opacity: "100%",
      }
    );
  });

  useOnClickOutside(sidebarRef as RefObject<HTMLElement>, closeSidebar);

  return (
    <NavContext.Provider value={{ openSidebar, closeSidebar }}>
      <div className="" ref={GSAPContainer}>
        {/* <div className="fixed lg:static left-0 top-0 h-screen border-r w-[18rem] bg-green-100 z-[99]"> */}
        <div
          className="fixed lg:hidden left-[-18rem] top-0 h-screen border-r border-white/15 w-[18rem] max-w-full bg-white z-[99]"
          ref={sidebarRef}
        >
          <div className="p-6 flex justify-end">
            <Button className="cursor-pointer" onPress={closeSidebar}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="size-6"
              >
                <title>close</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>

          <div className="flex flex-col gap-8 justify-between h-[calc(100vh-10rem)]">
            {/* <MobileNavDisclosures /> */}
            <div className="flex flex-col gap-4 px-4 mt-4">
              {navMenus.map((item) => (
                <Link
                  key={item}
                  className="font-medium text-lg text-center"
                  href="#"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div ref={overlayRef}>
          <nav
            ref={navRef}
            className="fixed top-0 left-0 right-0 z-50 py-2 mx-auto backdrop-blur-2xl"
          >
            <div className="lg:max-w-7xl mx-auto">
              <div className="container mx-auto px-4 flex gap-6 justify-between items-center">
                <div className="flex gap-4 items-center">
                  <Button
                    className="cursor-pointer lg:hidden"
                    onPress={openSidebar}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-full w-7 flex-none"
                    >
                      <title>menu</title>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                      />
                    </svg>
                  </Button>
                  <Link href="/" className="relative font-medium flex-none">
                    {/* <Pic src="/global/logo-full.svg" alt="logo" /> */}
                    <p className="text-3xl bg-pry whitespace-nowrap header">
                      OneClickDrive
                    </p>
                  </Link>
                </div>
                <div className="gap-4 xl:gap-6 items-center hidden lg:flex">
                  {navMenus.map((item) => (
                    <Link
                      key={item}
                      className="font-medium hover:scale-105 transition ease-in-out"
                      href="#"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
          {/* <div className="pt-[3.5rem]">{children}</div> */}
          <div ref={smoothScrollContainer}>{children}</div>
        </div>
      </div>
    </NavContext.Provider>
  );
}

export function useNavbar() {
  return useContext(NavContext);
}
