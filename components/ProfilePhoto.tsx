import Image from "next/image";
import photo from "@/public/images/profile-transparent.png";

/**
 * Circular portrait for the identity blocks (sidebar, mobile bar, hero).
 * Always shown beside the visible name, so it is decorative to screen readers
 * (empty alt) — an alt of the name would just be read twice.
 *
 * The square source is clipped to a circle for a compact head-and-shoulders crop.
 * The background uses the local theme token so the animated old-theme sheet keeps
 * its original color until the wipe reaches the portrait.
 *
 * `size` is the largest rendered size in px. Pass sizing classes in `className`
 * for a responsive photo; without them the photo is fixed at `size`.
 */
export default function ProfilePhoto({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={`profile-photo-frame relative block shrink-0 overflow-hidden rounded-full border-0 bg-background ${className ?? ""}`}
      style={className ? undefined : { width: size, height: size }}
    >
      <Image
        src={photo}
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        loading="eager"
        className="size-full border-0 object-cover opacity-85 brightness-[.9] contrast-[.92] saturate-[.9] drop-shadow-sm"
      />
    </span>
  );
}
