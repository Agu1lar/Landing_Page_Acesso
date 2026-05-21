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
      className="h-10 w-auto max-w-[9.5rem] object-contain grayscale transition-[filter] duration-300 group-hover:grayscale-0 motion-reduce:transition-none"
      height={40}
      sizes="(max-width: 640px) 40vw, 9.5rem"
      src={props.src}
      width={152}
    />
  );
}
