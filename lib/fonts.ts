import {Oswald, Quattrocento} from "next/font/google";

const oswald = Oswald({
    variable: "--font-oswald",
    display: "swap",
    weight: ["300", "400", "500", "700"],
    subsets: ["latin"],
});

const quattrocento = Quattrocento({
    variable: "--font-quattrocento",
    display: "swap",
    weight: ["400", "700"],
    subsets: ["latin"],
});

export {oswald, quattrocento};
