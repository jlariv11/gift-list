import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface HighlightProps {
    targetRef: React.RefObject<HTMLElement | null>;
}

export function HighlightSquare({ targetRef }: HighlightProps) {
    const [pos, setPos] = useState({
        top: 0,
        left: 0,
        width: 0,
        height: 0,
    });

    useEffect(() => {
        function update() {
            const el = targetRef.current;
            if (!el) return;

            const rect = el.getBoundingClientRect();

            const padding = 10;

            setPos({
                top: rect.top + window.scrollY - padding,
                left: rect.left + window.scrollX - padding,
                width: rect.width + padding * 2,
                height: rect.height + padding * 2,
            });
        }

        update();
        window.addEventListener("resize", update);
        window.addEventListener("scroll", update);

        return () => {
            window.removeEventListener("resize", update);
            window.removeEventListener("scroll", update);
        };
    }, [targetRef]);

    return ReactDOM.createPortal(
        <div
            className="
        absolute
        border-4
        border-orange-400
        shadow-[0_0_20px_10px_rgba(255,165,0,0.5)]
        pointer-events-none
        z-[45]
      "
            style={{
                top: pos.top,
                left: pos.left,
                width: pos.width,
                height: pos.height,
            }}
        />,
        document.body
    );
}
