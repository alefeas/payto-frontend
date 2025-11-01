import Image from "next/image";

export default function HoldingPhone() {
  return (
    <div className="relative w-full flex items-center justify-center min-h-[400px]">
      <div className="relative w-full max-w-[600px] h-[350px] bg-gradient-to-br from-[#002bff] via-[#0078ff] to-[#0000d4] rounded-[3rem]">
        {/* Blue gradient background */}
        <div className="absolute inset-0 overflow-visible">
          <Image
            src="/images/holding-phone.png"
            alt="Phone showing payment interface"
            width={600}
            height={600}
            className="absolute -bottom-8 -right-[10px] w-full h-[500px] object-contain rounded-3xl "
            priority
          />
        </div>
      </div>
    </div>
  );
}
