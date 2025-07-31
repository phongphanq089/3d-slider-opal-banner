import { isNonEmptyArray } from "@/lib/utilities/is-non-empty-array";
import { Slide } from ".";
import { RefObject, useMemo, useCallback } from "react";

interface ContentProps {
    slides: Slide[];
    contentRefs?: RefObject<(HTMLDivElement | null)[]>;
}

const Content = ({ slides, contentRefs }: ContentProps) => {

    // Memoize the ref setter to prevent unnecessary re-renders
    const setContentRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
        if (contentRefs?.current) {
            contentRefs.current[index] = el;
        }
    }, [contentRefs]);

    // Memoize content elements to prevent unnecessary re-renders
    const contentElements = useMemo(() =>
        slides.map(({ title, date, description, field, type }, index) => (
            <div
                className="fixed top-[30vh] w-full text-white"
                key={index}
                ref={setContentRef(index)}>
                <h2 className="font-oswald title mb-10 px-5 text-center text-5xl font-medium uppercase lg:text-8xl">
                    {title}
                </h2>
                <div className="px-5 text-center lg:pl-[50%] lg:text-left">
                    <p className="description mb-12 max-w-md">{description}</p>
                    <ul className="font-oswald list uppercase">
                        <li className="overflow-hidden">
                            <span className="block">
                                Type.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {type}
                            </span>
                        </li>
                        <li className="overflow-hidden">
                            <span className="block">
                                Field.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {field}
                            </span>
                        </li>
                        <li className="overflow-hidden">
                            <span className="block">
                                Date.&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                                {date}
                            </span>
                        </li>
                    </ul>
                </div>
            </div>
        )), [slides, setContentRef]);
    if (!isNonEmptyArray(slides)) return null;

    return <>{contentElements}</>;
};

export { Content };
