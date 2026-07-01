"use client";

import { useEffect, useRef, useState } from "react";
import { atlasSpriteThumbStyle } from "@/lib/avatar/atlas";
import {
  AVATAR_PICKER_THUMB_PX,
  SKIN_TONE_HEAD_ASPECT,
  SKIN_TONE_HEAD_TOP_SKIP,
  thumbCropForSlot,
} from "@/lib/avatar/avatar-thumb";
import { assetUrl } from "@/lib/student-api";
import type { AvatarSlot } from "@/lib/student-api";
import { useAvatarAtlas } from "./AvatarAtlasProvider";

interface Props {
  slot: AvatarSlot;
  previewPath: string;
  selected?: boolean;
  saving?: boolean;
  title?: string;
  onClick: () => void;
  disabled?: boolean;
}

export function AvatarSpriteOption({
  slot,
  previewPath,
  selected,
  saving,
  title,
  onClick,
  disabled,
}: Props) {
  const { manifest } = useAvatarAtlas();
  const measureRef = useRef<HTMLSpanElement>(null);
  const [thumbPx, setThumbPx] = useState(AVATAR_PICKER_THUMB_PX);
  const crop = thumbCropForSlot(slot);
  const headCrop = crop === "head-top";
  const headAspect = `1 / ${SKIN_TONE_HEAD_ASPECT}`;

  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setThumbPx(Math.round(w));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [manifest, previewPath, headCrop]);

  const sprite = manifest
    ? atlasSpriteThumbStyle(manifest, previewPath, thumbPx, crop)
    : null;

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      className={`avatar-option${selected ? " selected" : ""}${saving ? " saving" : ""}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <span ref={measureRef} className="avatar-thumb-measure block w-full">
        {sprite ? (
          <span
            className={`avatar-sprite-thumb${headCrop ? " avatar-sprite-thumb--head" : ""}`}
            style={{
              ...(headCrop ? { aspectRatio: headAspect } : {}),
              backgroundImage: sprite.backgroundImage,
              backgroundSize: sprite.backgroundSize,
              backgroundPosition: sprite.backgroundPosition,
            }}
          />
        ) : (
          <span
            className={`avatar-png-thumb${headCrop ? " avatar-png-thumb--head" : ""}`}
            style={headCrop ? { aspectRatio: headAspect } : undefined}
          >
            <img
              src={assetUrl(previewPath)}
              alt=""
              style={
                headCrop
                  ? {
                      objectPosition: `center ${SKIN_TONE_HEAD_TOP_SKIP * 100}%`,
                    }
                  : undefined
              }
            />
          </span>
        )}
      </span>
      {selected && <span className="avatar-check">✓</span>}
    </button>
  );
}
