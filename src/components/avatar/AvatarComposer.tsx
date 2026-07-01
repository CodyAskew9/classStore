"use client";

import {
  atlasHasFrame,
  atlasSpriteStyle,
  AVATAR_STACK_PX,
  avatarPortraitHeightPx,
} from "@/lib/avatar/atlas";
import { assetUrl } from "@/lib/student-api";
import { useAvatarAtlas } from "./AvatarAtlasProvider";

export type AvatarStackShape = "portrait" | "circle";

interface Props {
  renderPaths: string[];
  size?: keyof typeof AVATAR_STACK_PX;
  /** portrait = full body (222×350); circle = square crop for compact chips */
  shape?: AvatarStackShape;
  className?: string;
}

function defaultShape(size: keyof typeof AVATAR_STACK_PX): AvatarStackShape {
  return size === "md" || size === "sm" ? "circle" : "portrait";
}

function stackClass(size: keyof typeof AVATAR_STACK_PX, shape: AvatarStackShape): string {
  if (shape === "portrait") {
    return `avatar-stack avatar-stack--${size}-portrait`;
  }
  return `avatar-stack avatar-stack--${size}`;
}

export function AvatarComposer({
  renderPaths,
  size = "lg",
  shape,
  className = "",
}: Props) {
  const { manifest } = useAvatarAtlas();
  const resolvedShape = shape ?? defaultShape(size);
  const widthPx = AVATAR_STACK_PX[size];
  const useAtlas =
    manifest &&
    renderPaths.length > 0 &&
    renderPaths.every((path) => atlasHasFrame(manifest, path));

  const portraitStyle =
    resolvedShape === "portrait"
      ? { width: widthPx, height: avatarPortraitHeightPx(widthPx) }
      : undefined;

  return (
    <div
      className={`${stackClass(size, resolvedShape)}${className ? ` ${className}` : ""}`}
      style={portraitStyle}
      aria-hidden
    >
      {renderPaths.map((layer) => {
        if (useAtlas && manifest) {
          const sprite = atlasSpriteStyle(manifest, layer, widthPx);
          if (sprite) {
            return (
              <div
                key={layer}
                className="avatar-sprite-layer"
                style={{
                  backgroundImage: sprite.backgroundImage,
                  backgroundSize: sprite.backgroundSize,
                  backgroundPosition: sprite.backgroundPosition,
                }}
              />
            );
          }
        }
        return <img key={layer} className="avatar-layer" src={assetUrl(layer)} alt="" />;
      })}
    </div>
  );
}
