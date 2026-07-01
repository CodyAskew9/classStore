import { assetUrl } from "@/lib/student-api";

interface Props {
  renderPaths: string[];
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_CLASS = {
  xl: "avatar-stack avatar-stack--xl",
  lg: "avatar-stack avatar-stack--lg",
  md: "avatar-stack avatar-stack--md",
  sm: "avatar-stack avatar-stack--sm",
} as const;

export function AvatarComposer({ renderPaths, size = "lg", className = "" }: Props) {
  return (
    <div
      className={`${SIZE_CLASS[size]}${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      {renderPaths.map((layer) => (
        <img key={layer} className="avatar-layer" src={assetUrl(layer)} alt="" />
      ))}
    </div>
  );
}
