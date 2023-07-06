import Image from "next/image";

export interface GeneratedImageProps {
  src: string;
}

export default function GeneratedImage({ src }: GeneratedImageProps) {
  return (
    <div className="relative rounded-md">
      <Image
        className="h-full w-full object-contain"
        alt={src}
        src={src}
        width={512}
        height={512}
      />
    </div>
  );
}
