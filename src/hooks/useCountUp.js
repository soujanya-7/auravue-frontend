import { useState, useEffect, useRef } from "react";

/**
 * useCountUp — Animates a number from 0 to `end` when the element scrolls into view.
 * @param {number} end - The target number to count up to.
 * @param {number} duration - Animation duration in ms (default: 2000).
 * @param {string} suffix - Optional suffix to append (e.g. 'M+', '%').
 * @returns {{ count: number, ref: React.RefObject, suffix: string }}
 */
const useCountUp = (end, duration = 2000, suffix = "") => {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const started = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started.current) {
                    started.current = true;
                    let start = 0;
                    const step = end / (duration / 16);
                    const timer = setInterval(() => {
                        start += step;
                        if (start >= end) {
                            setCount(end);
                            clearInterval(timer);
                        } else {
                            setCount(Math.floor(start));
                        }
                    }, 16);
                }
            },
            { threshold: 0.5 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [end, duration]);

    return { count, ref, suffix };
};

export default useCountUp;
