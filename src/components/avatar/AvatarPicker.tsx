"use client";

import { useCallback, useEffect, useState } from "react";
import {
  assetLabel,
  assetUrl,
  fetchAvatarCatalog,
  isAssetSelected,
  selectAvatarSlot,
  selectBodyType,
  selectFantasyOutfit,
  type AvatarCatalog,
  type AvatarConfig,
  type AvatarSlot,
  type BodyType,
  type StudentProfile,
} from "@/lib/student-api";
import { AvatarComposer } from "./AvatarComposer";

interface Props {
  student: StudentProfile;
  onAvatarChange: (config: AvatarConfig, renderPaths: string[]) => void;
}

type TabId = "Character" | "Hair" | "Face" | "Outfit" | "Fantasy";

const TABS: TabId[] = ["Character", "Hair", "Face", "Outfit", "Fantasy"];

const TAB_SLOTS: Record<Exclude<TabId, "Fantasy">, AvatarSlot[]> = {
  Character: ["body"],
  Hair: ["hair", "hairBack", "bangs", "hairBonus"],
  Face: ["pupils", "eyebrows", "eyelashes", "mouth"],
  Outfit: ["top", "bottom", "shoes", "gloves"],
};

function slotsForTab(tab: TabId, bodyType: BodyType): AvatarSlot[] {
  if (tab === "Fantasy") return [];
  if (tab === "Face") {
    return bodyType === "male" ? [...TAB_SLOTS.Face, "beard"] : TAB_SLOTS.Face;
  }
  if (tab === "Outfit") {
    return bodyType === "female"
      ? ["top", "bottom", "dress", "shoes", "gloves"]
      : TAB_SLOTS.Outfit;
  }
  return TAB_SLOTS[tab];
}

export function AvatarPicker({ student, onAvatarChange }: Props) {
  const [catalog, setCatalog] = useState<AvatarCatalog | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("Character");
  const [activeSlot, setActiveSlot] = useState<AvatarSlot>("body");
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const bodyType = student.avatarConfig.bodyType ?? "male";

  const loadCatalog = useCallback(async (type: BodyType) => {
    try {
      const data = await fetchAvatarCatalog(type);
      setCatalog(data);
      setError(null);
    } catch {
      setError("Could not load avatars");
    }
  }, []);

  useEffect(() => {
    loadCatalog(bodyType);
  }, [bodyType, loadCatalog]);

  useEffect(() => {
    const slots = slotsForTab(activeTab, bodyType);
    if (slots.length > 0 && !slots.includes(activeSlot)) {
      setActiveSlot(slots[0]);
    }
  }, [activeTab, activeSlot, bodyType]);

  const tabSlots = slotsForTab(activeTab, bodyType);
  const activeCategory = catalog?.categories.find((c) => c.slot === activeSlot);

  async function handleBodyType(type: BodyType) {
    if (saving || type === bodyType) return;
    setSaving("bodyType");
    setError(null);
    try {
      const result = await selectBodyType(student.id, type);
      onAvatarChange(result.avatarConfig, result.avatarRenderPaths);
    } catch {
      setError("Could not update character.");
    } finally {
      setSaving(null);
    }
  }

  async function handleSelect(slot: AvatarSlot, asset: string) {
    if (saving) return;
    const key = `${slot}:${asset}`;
    setSaving(key);
    setError(null);
    try {
      const result = await selectAvatarSlot(student.id, slot, asset);
      onAvatarChange(result.avatarConfig, result.avatarRenderPaths);
    } catch {
      setError("Could not save avatar. Try again.");
    } finally {
      setSaving(null);
    }
  }

  async function handleFantasyOutfit(outfitId: string) {
    if (saving) return;
    setSaving(`outfit:${outfitId}`);
    setError(null);
    try {
      const result = await selectFantasyOutfit(student.id, outfitId);
      onAvatarChange(result.avatarConfig, result.avatarRenderPaths);
    } catch {
      setError("Could not apply outfit.");
    } finally {
      setSaving(null);
    }
  }

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    const slots = slotsForTab(tab, bodyType);
    if (slots.length > 0) setActiveSlot(slots[0]);
  }

  return (
    <section className="panel avatar-panel">
      <div className="panel-header">
        <h2 className="font-display text-xl font-semibold">Your avatar</h2>
        <p className="text-sm text-muted">
          Build your fantasy hero — boys and girls share skin tones but get their own styles
        </p>
      </div>

      <div className="current-avatar-wrap">
        <AvatarComposer renderPaths={student.avatarRenderPaths} size="lg" />
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="body-type-picker">
        <span className="body-type-label">Character</span>
        <div className="body-type-buttons" role="group" aria-label="Boy or girl">
          <button
            type="button"
            className={`body-type-btn${bodyType === "male" ? " active" : ""}`}
            onClick={() => handleBodyType("male")}
            disabled={!!saving}
          >
            Boy
          </button>
          <button
            type="button"
            className={`body-type-btn${bodyType === "female" ? " active" : ""}`}
            onClick={() => handleBodyType("female")}
            disabled={!!saving}
          >
            Girl
          </button>
        </div>
      </div>

      {catalog && (
        <>
          <div className="avatar-slot-tabs" role="tablist" aria-label="Avatar categories">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={activeTab === tab}
                className={`slot-tab${activeTab === tab ? " active" : ""}`}
                onClick={() => selectTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab !== "Fantasy" && tabSlots.length > 1 && (
            <div className="avatar-slot-subtabs">
              {tabSlots.map((slot) => {
                const cat = catalog.categories.find((c) => c.slot === slot);
                if (!cat) return null;
                return (
                  <button
                    key={slot}
                    type="button"
                    className={`slot-subtab${activeSlot === slot ? " active" : ""}`}
                    onClick={() => setActiveSlot(slot)}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === "Fantasy" ? (
            <div className="avatar-section">
              <p className="section-hint text-sm text-muted">
                Pick one fantasy outfit — tap again to take it off
              </p>
              <div className="fantasy-outfit-grid" role="listbox" aria-label="Fantasy outfits">
                {catalog.fantasyOutfits.map((outfit) => {
                  const selected = student.avatarConfig.fantasyOutfitId === outfit.id;
                  return (
                    <button
                      key={outfit.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className={`fantasy-outfit-card${selected ? " selected" : ""}`}
                      onClick={() => handleFantasyOutfit(outfit.id)}
                      disabled={!!saving}
                      title={outfit.description}
                    >
                      <AvatarComposer renderPaths={outfit.previewPaths} size="sm" />
                      <span className="fantasy-outfit-name">{outfit.label}</span>
                      {selected && <span className="avatar-check">✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            activeCategory && (
              <div className="avatar-section">
                <p className="section-hint text-sm text-muted">
                  {activeSlot === "body"
                    ? "Any skin tone works for boys and girls — clothing stays on"
                    : activeCategory.required
                      ? "Pick a style — essentials always stay equipped"
                      : "Optional — tap to add or remove"}
                </p>
                <div className="avatar-grid" role="listbox" aria-label={activeCategory.label}>
                  {activeCategory.assets.map((item) => {
                    const selected = isAssetSelected(
                      student.avatarConfig,
                      activeSlot,
                      item.filename,
                    );
                    const key = `${activeSlot}:${item.filename}`;
                    const isSaving = saving === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        role="option"
                        aria-selected={selected}
                        className={`avatar-option${selected ? " selected" : ""}${isSaving ? " saving" : ""}`}
                        onClick={() => handleSelect(activeSlot, item.filename)}
                        disabled={!!saving}
                        title={assetLabel(item.filename)}
                      >
                        <img src={assetUrl(item.previewPath)} alt="" />
                        {selected && <span className="avatar-check">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </>
      )}
    </section>
  );
}
