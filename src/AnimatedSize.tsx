import { ReactNode, useLayoutEffect, useRef } from "react";
import { ClipBox } from "./ClipBox";

export function AnimatedSize({children, duration, timingFunction}: {
    children: ReactNode,
    duration: string,
    timingFunction?: string,
}) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const lowerSizeRef = useRef<{width: number, height: number}>(null);
    const upperSizeRef = useRef<{width: number, height: number}>(null);

    useLayoutEffect(() => {
        const wrapper = wrapperRef.current;
        const wrapperInner = wrapper.firstElementChild as HTMLElement;

        const rect = wrapperInner.getBoundingClientRect();
        const size = {
            width: rect.width,
            height: rect.height
        }

        lowerSizeRef.current = size;
        upperSizeRef.current = size;

        // Called when a child is reflowed and added or removed, or the style changes.
        const observer1 = new MutationObserver(() => {
            {
                const a = wrapperInner.firstElementChild.getBoundingClientRect();
                const b = upperSizeRef.current;

                // The measured size must be different from the previous size.
                if (a.width == b.width && a.height == b.height) {
                    return;
                }
            }

            wrapper.style.width = null;
            wrapper.style.height = null;
            wrapperInner.style.minWidth = null;
            wrapperInner.style.minHeight = null;

            const rect = wrapperInner.getBoundingClientRect(); // reflowed
            const size = {
                width: rect.width,
                height: rect.height
            }

            // If the printed size is different from the unique size,
            // the exact size cannot be calculated.
            if (Math.round(size.width)  != wrapperInner.offsetWidth
             || Math.round(size.height) != wrapperInner.offsetHeight) {
                return;
            }
            
            upperSizeRef.current = size;

            wrapper.style.width = `${lowerSizeRef.current.width}px`;
            wrapper.style.height = `${lowerSizeRef.current.height}px`;

            wrapperInner.getBoundingClientRect(); // reflowed

            wrapper.style.width  = `${size.width}px`;
            wrapper.style.height = `${size.height}px`;
            wrapperInner.style.minWidth = `${size.width}px`;
            wrapperInner.style.minHeight = `${size.height}px`;
        });

        const observer2 = new ResizeObserver(() => {
            const rect = wrapper.getBoundingClientRect();
            lowerSizeRef.current = {
                width: rect.width,
                height: rect.height
            }
        });

        observer2.observe(wrapper, {});
        observer1.observe(wrapperInner.firstChild, {
            attributes: true,
            childList: true,
            subtree: true,
            characterData: true
        });

        return () => {
            observer1.disconnect();
            observer2.disconnect();
        }
    }, []);

    return (
        <ClipBox
            refer={wrapperRef}
            transitionProperty="width, height"
            transitionDuration={duration}
            transitionTimingFunction={timingFunction}
        >
            <div>{children}</div>
        </ClipBox>
    )
}