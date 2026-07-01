import { assetUrl } from "../api";

interface Props {
  renderPaths: string[];
  size?: "sm" | "lg";
  className?: string;
}

export function AvatarComposer({ renderPaths, size = "lg", className = "" }: Props) {
  return (
    <div
      className={`avatar-stack avatar-stack--${size}${className ? ` ${className}` : ""}`}
      aria-hidden
    >
      {renderPaths.map((layer) => (
        <img key={layer} className="avatar-layer" src={assetUrl(layer)} alt="" />
      ))}
    </div>
  );
}
