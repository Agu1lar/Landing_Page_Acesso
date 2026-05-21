import Image from 'next/image';

type ClientLogoImageProps = {
  alt: string;
  src: string;
};

/**
 * Single transparent client logo in the trust strip.
 */
export function ClientLogoImage(props: ClientLogoImageProps) {
  return (
    <Image
      alt={props.alt}
      className="h-14 w-auto max-w-[12rem] object-contain sm:h-16 sm:max-w-[14rem]"
      height={64}
      sizes="(max-width: 640px) 45vw, 14rem"
      src={props.src}
      width={224}
    />
  );
}
