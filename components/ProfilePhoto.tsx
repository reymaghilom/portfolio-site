import Image from "next/image";
import photo from "@/public/images/profile.webp";

/**
 * Circular portrait for the identity blocks (sidebar, mobile bar, hero).
 * Always shown beside the visible name, so it is decorative to screen readers
 * (empty alt) — an alt of the name would just be read twice.
 *
 * The source is a square half-body shot; scaling it inside a clipped circle,
 * anchored near the face, gives a head-and-shoulders crop. Partial desaturation
 * keeps it natural while sitting quietly in the monochrome palette.
 *
 * `size` is the largest rendered size in px. Pass sizing classes in `className`
 * for a responsive photo; without them the photo is fixed at `size`.
 */
export default function ProfilePhoto({ size, className }: { size: number; className?: string }) {
  return (
    <span
      className={`relative block shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200 ${className ?? ""}`}
      style={className ? undefined : { width: size, height: size }}
    >
      <Image
        src={photo}
        alt=""
        width={size}
        height={size}
        // Request enough pixels for the 1.5× zoom so the crop stays sharp.
        sizes={`${Math.ceil(size * 1.5)}px`}
        loading="eager"
        className="size-full origin-[50%_28%] scale-150 object-cover grayscale-[65%]"
      />
    </span>
  );
}
