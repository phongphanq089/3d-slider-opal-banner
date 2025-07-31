import type {Metadata} from "next";
import "./globals.css";
import {LenisProvider} from "@/providers/LenisProvider";
import {GsapProvider} from "@/providers/GsapProvider";
import {cn} from "@/lib/utilities/cn";
import {oswald, quattrocento} from "@/lib/fonts";

export const metadata: Metadata = {
    title: "Khoa Phan Playground",
    description: "Khoa Phan's Playground",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={cn(
                    "font-quattrocento antialiased",
                    oswald.variable,
                    quattrocento.variable
                )}>
                <LenisProvider>{children}</LenisProvider>
                <GsapProvider scrollTrigger />
            </body>
        </html>
    );
}
