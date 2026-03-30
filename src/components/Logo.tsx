import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo.png"
      alt="Dou-Mar Tax Services Ltd."
      width={140}
      height={90}
      className="object-contain"
      priority
    />
  );
}
