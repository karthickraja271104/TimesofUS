import { motion } from "framer-motion";

export default function Heart({ size = 300, color = "#ff4d6d" }) {
return (
<div className="flex items-center justify-center">
<svg
viewBox="0 0 512 512"
width={size}
height={size}
>
<path
d="M256 464
C256 464 32 320 32 176
C32 96 96 48 160 48
C208 48 240 80 256 112
C272 80 304 48 352 48
C416 48 480 96 480 176
C480 320 256 464 256 464 Z"
fill={color}
/>
</svg>
</div>
);
}