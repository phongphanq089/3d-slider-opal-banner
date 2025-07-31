"use client";
import { fragmentShader, vertexShader } from "./shader";
import { useLoader } from "@react-three/fiber";
import gsap from "gsap";
import { createContext, useCallback, useContext, useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useWindowSize } from "usehooks-ts";

interface Slider3DContextType {
    isTransitioning: React.RefObject<boolean>;
    currentSlideIndex: React.RefObject<number>;
    lastSlideIndex: React.RefObject<number | null>;
    slideTextures: THREE.Texture[];
    shaderMaterial: THREE.ShaderMaterial;
    handleSlideChange: (targetIndex?: number) => void;
}

const Slider3DContext = createContext<Slider3DContextType | undefined>(
    undefined
);

export function Slider3DProvider({
    children,
    slides,
    containerSize,
}: {
    children: React.ReactNode;
    slides: { image: string }[];
    containerSize?: { width: number; height: number };
}) {
    const isTransitioning = useRef<boolean>(false);
    const currentSlideIndex = useRef<number>(0);
    const lastSlideIndex = useRef<number | null>(null);
    const animationRef = useRef<gsap.core.Timeline | null>(null);

    const { height: windowHeight, width: windowWidth } = useWindowSize();
    const width = containerSize?.width ?? windowWidth;
    const height = containerSize?.height ?? windowHeight;

    // Load textures with error handling
    const loadedTextures = useLoader(
        THREE.TextureLoader,
        slides.map((s) => s.image),
        (loader) => {
            // Configure loader for better performance
            loader.setCrossOrigin('anonymous');
        }
    );

    // Memoize texture processing to prevent recreation on every render
    const slideTextures = useMemo(() => {
        return loadedTextures.map((texture) => {
            // Optimize texture settings for performance
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.generateMipmaps = false; // Disable mipmaps for 2D textures
            texture.userData = {
                size: new THREE.Vector2(
                    texture.image.width,
                    texture.image.height
                ),
            };
            return texture;
        });
    }, [loadedTextures]);

    // Memoize shader material with optimized uniforms
    const shaderMaterial = useMemo(() => {
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture1: { value: slideTextures?.[0] ?? null },
                uTexture2: { value: slideTextures?.[1] ?? null },
                uProgress: { value: 0 },
                uResolution: { value: new THREE.Vector2(width, height) },
                uTexture1Size: {
                    value:
                        slideTextures?.[0]?.userData.size ??
                        new THREE.Vector2(1, 1),
                },
                uTexture2Size: {
                    value:
                        slideTextures?.[1]?.userData.size ??
                        new THREE.Vector2(1, 1),
                },
            },
            vertexShader,
            fragmentShader,
            transparent: false, // Disable transparency for better performance
        });

        return material;
    }, [slideTextures, width, height]);

    // Optimized slide change handler with proper cleanup
    const handleSlideChange = useCallback((targetIndex?: number) => {
        if (isTransitioning.current) return;

        // Kill any existing animation
        if (animationRef.current) {
            animationRef.current.kill();
        }

        isTransitioning.current = true;
        const nextIndex =
            targetIndex ??
            (currentSlideIndex.current + 1) % slideTextures.length;
        const lastIndex = currentSlideIndex.current;
        lastSlideIndex.current = lastIndex;

        // Update shader uniforms
        shaderMaterial.uniforms.uTexture1.value =
            slideTextures[currentSlideIndex.current];
        shaderMaterial.uniforms.uTexture2.value = slideTextures[nextIndex];

        shaderMaterial.uniforms.uTexture1Size.value =
            slideTextures[currentSlideIndex.current]?.userData.size;
        shaderMaterial.uniforms.uTexture2Size.value =
            slideTextures[nextIndex]?.userData.size;

        // Create new animation timeline
        animationRef.current = gsap.timeline()
            .fromTo(
                shaderMaterial.uniforms.uProgress,
                {
                    value: 0,
                },
                {
                    value: 1,
                    duration: 5,
                    ease: "power1.out",
                }
            )
            .call(
                () => {
                    isTransitioning.current = false;
                    currentSlideIndex.current = nextIndex;

                    shaderMaterial.uniforms.uProgress.value = 0;
                    shaderMaterial.uniforms.uTexture1.value =
                        slideTextures[nextIndex];
                    shaderMaterial.uniforms.uTexture1Size.value =
                        slideTextures[nextIndex]?.userData.size;
                },
                [],
                0
            );
    }, [slideTextures, shaderMaterial]);

    // Cleanup animations on unmount
    useEffect(() => {
        return () => {
            if (animationRef.current) {
                animationRef.current.kill();
            }
        };
    }, []);

    const value = useMemo(() => ({
        isTransitioning,
        currentSlideIndex,
        lastSlideIndex,
        slideTextures,
        handleSlideChange,
        shaderMaterial,
    }), [slideTextures, handleSlideChange, shaderMaterial]);

    return (
        <Slider3DContext.Provider value={value}>
            {children}
        </Slider3DContext.Provider>
    );
}

export function useSlider3DContext() {
    const context = useContext(Slider3DContext);
    if (!context) {
        throw new Error(
            "useSlider3DContext must be used within a Slider3DProvider"
        );
    }
    return context;
}
