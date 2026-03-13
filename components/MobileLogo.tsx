"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function MobileLogo() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () => setIsLight(document.documentElement.classList.contains("light-mode"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mobile-logo">
      <Image
        src={isLight ? "/logo-light.png" : "/logo.png"}
        alt="Email Evolution"
        width={120}
        height={40}
        style={{ objectFit: "contain", objectPosition: "left" }}
      />
    </div>
  );
}
