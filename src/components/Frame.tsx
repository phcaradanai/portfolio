import Link from "next/link";

type Props = {
  src: string; width: number; height: number; alt: string;
  href?: string; priority?: boolean; sizes?: string; className?: string; srcSet?: string;
  transitionName?: string;
  children?: React.ReactNode;
};

/** A work hung on the wall: varnished frame, drop shadow, lamp above. */
export function Frame({ src, width, height, alt, href, priority, sizes, srcSet, transitionName, className = "", children }: Props) {
  const img = (
    <span className="frame__mat">
      {children ?? (
        // eslint-disable-next-line @next/next/no-img-element -- static export; files are pre-optimised by scripts/optimize-media.ts
        <img src={src} srcSet={srcSet} sizes={sizes} width={width} height={height} alt={alt}
          loading={priority ? "eager" : "lazy"} decoding={priority ? "sync" : "async"} fetchPriority={priority ? "high" : "auto"} />
      )}
    </span>
  );
  return href
    ? <Link className={`frame frame--link ${className}`} href={href} style={transitionName ? { viewTransitionName: transitionName } : undefined}>{img}</Link>
    : <figure className={`frame ${className}`} style={transitionName ? { viewTransitionName: transitionName } : undefined}>{img}</figure>;
}
