import Image from "next/image";

export default function HoldingPhone() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Image
        src="/images/landing-page-hero-image-01.png"
        alt="Payto application interface"
        width={600}
        height={600}
        className="w-full h-auto object-contain"
        priority
      />
    </div>
  );
}
