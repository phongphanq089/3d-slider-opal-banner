"use client";
import { OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Slider3DProvider, useSlider3DContext } from "./context";
import Pagination from "./pagination";
import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIsClient, useResizeObserver } from "usehooks-ts";
import { Content } from "./content";
import { Credit } from "./credit";

export interface Slide {
    image: string;
    title: string;
    description: string;
    type: string;
    field: string;
    date: string;
}

export const slides: Slide[] = [
    {
        title: "Echo Forms",
        description:
            "A generative art experiment that visualizes sound vibrations through blurred motion and abstract shapes. The project explores the intersection of audio input and fluid visuals.",
        type: "Experimental Visual",
        field: "Creative Coding / Motion Design",
        date: "March 2025",
        image: "/slide-1.jpeg",
    },
    {
        title: "Dream Mesh",
        description:
            "An ambient visual series that distorts geometric grids into flowing, organic compositions. Inspired by lucid dreaming states and soft color transitions.",
        type: "Visual Series",
        field: "Digital Art / Abstract UI Concepts",
        date: "February 2025",
        image: "/slide-2.jpeg",
    },
    {
        title: "Mist UI",
        description:
            "A conceptual UI design where interface elements melt into the background, emphasizing atmosphere over clarity. Designed for meditation or ambient music platforms.",
        type: "UI Concept",
        field: "Product Design / Experimental UI",
        date: "April 2025",
        image: "/slide-3.png",
    },
    {
        title: "Phantom Flow",
        description:
            "A kinetic art piece simulating emotional rhythms using shifting gradients and diffused shapes. It reflects how moods ebb and flow in a digital environment.",
        type: "Motion Graphic",
        field: "Visual Storytelling / Emotion Design",
        date: "January 2025",
        image: "/slide-4.jpeg",
    },
];

// Memoized slides to prevent unnecessary re-renders
const memoizedSlides = slides;

const Slider3D = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
    const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { width = 0, height = 0 } = useResizeObserver({
        ref: containerRef as RefObject<HTMLElement>,
        box: "border-box",
    });

    const isClient = useIsClient();
    const [isResizing, setIsResizing] = useState(false);

    // Memoize container size to prevent unnecessary re-renders
    const containerSize = useMemo(() => ({ width, height }), [width, height]);

    // Optimized resize handler with proper cleanup
    const handleResize = useCallback(() => {
        setIsResizing(true);

        // Clear existing timeout
        if (resizeTimeoutRef.current) {
            clearTimeout(resizeTimeoutRef.current);
        }

        // Debounce resize detection
        resizeTimeoutRef.current = setTimeout(() => {
            setIsResizing(false);
        }, 100); // Increased debounce time for better performance
    }, []);

    useEffect(() => {
        window.addEventListener("resize", handleResize, { passive: true });

        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeTimeoutRef.current) {
                clearTimeout(resizeTimeoutRef.current);
            }
        };
    }, [handleResize]);

    // Memoize the provider value to prevent unnecessary re-renders
    const providerValue = useMemo(() => ({
        slides: memoizedSlides,
        containerSize
    }), [containerSize]);

    return (
        <div
            data-slot="slider-3d"
            className="relative size-full"
            ref={containerRef}>
            {isClient && (
                <Slider3DProvider {...providerValue}>
                    {!isResizing && (
                        <Canvas
                            className="brightness-80"
                            gl={{
                                antialias: true,
                                powerPreference: "high-performance",
                                stencil: false,
                                depth: false
                            }}
                        >
                            <OrthographicCamera
                                makeDefault
                                left={-1}
                                right={1}
                                top={1}
                                bottom={-1}
                                near={0}
                                far={1}
                            />
                            <ShaderPlane />
                        </Canvas>
                    )}
                    <Content contentRefs={contentRefs} slides={memoizedSlides} />
                    <Pagination
                        containerRef={containerRef}
                        slides={memoizedSlides}
                        contentRefs={contentRefs}
                    />
                    <Credit />
                </Slider3DProvider>
            )}
        </div>
    );
};

// Memoized shader plane component
const ShaderPlane = () => {
    const { shaderMaterial } = useSlider3DContext();

    return (
        <mesh>
            <planeGeometry args={[2, 2]} />
            <primitive object={shaderMaterial} attach="material" />
        </mesh>
    );
};

export { Slider3D };
