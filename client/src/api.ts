export type BodyType = "male" | "female";

export type AvatarSlot =
  | "body"
  | "pupils"
  | "eyebrows"
  | "eyelashes"
  | "mouth"
  | "beard"
  | "hairBack"
  | "hair"
  | "bangs"
  | "hairBonus"
  | "top"
  | "bottom"
  | "dress"
  | "gloves"
  | "shoes"
  | "accessory";

export interface AvatarConfig {
  colorMode: boolean;
  bodyType: BodyType;
  body: string;
  pupils: string;
  eyebrows: string;
  eyelashes: string;
  mouth: string | null;
  beard: string | null;
  hairBack: string | null;
  hair: string | null;
  bangs: string | null;
  hairBonus: string | null;
  top: string | null;
  bottom: string | null;
  dress: string | null;
  gloves: string | null;
  shoes: string | null;
  fantasyOutfitId: string | null;
}

export interface FantasyOutfit {
  id: string;
  label: string;
  description: string;
  previewPaths: string[];
}

export interface CatalogAsset {
  filename: string;
  previewPath: string;
}

export interface CatalogCategory {
  slot: AvatarSlot;
  label: string;
  required: boolean;
  toggle: boolean;
  assets: CatalogAsset[];
}

export interface AvatarCatalog {
  defaults: AvatarConfig;
  renderOrder: AvatarSlot[];
  bodyTypes: {
    male: { label: string; bodies: string[] };
    female: { label: string; bodies: string[] };
  };
  fantasyOutfits: FantasyOutfit[];
  categories: CatalogCategory[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  createdAt: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  avatarConfig: AvatarConfig;
  avatarRenderPaths: string[];
  balance: number;
  class: { id: string; name: string } | null;
  recentTransactions: Transaction[];
}


export function assetUrl(relativePath: string): string {
  return `/assets/${relativePath}`;
}

export function isAssetSelected(
  config: AvatarConfig,
  slot: AvatarSlot,
  filename: string,
): boolean {
  return config[slot] === filename;
}

export async function fetchDemoStudentId(): Promise<string> {
  const res = await fetch("/api/dev/student");
  if (!res.ok) {
    throw new Error("No demo student. Run npm run db:seed in server.");
  }
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function fetchStudent(id: string): Promise<StudentProfile> {
  const res = await fetch(`/api/students/${id}`);
  if (!res.ok) throw new Error("Failed to load student");
  return res.json() as Promise<StudentProfile>;
}

export async function fetchAvatarCatalog(bodyType: BodyType): Promise<AvatarCatalog> {
  const res = await fetch(`/api/students/avatars?bodyType=${bodyType}`);
  if (!res.ok) throw new Error("Failed to load avatars");
  return res.json() as Promise<AvatarCatalog>;
}

export async function selectBodyType(
  studentId: string,
  bodyType: BodyType,
): Promise<{ avatarConfig: AvatarConfig; avatarRenderPaths: string[] }> {
  const res = await fetch(`/api/students/${studentId}/avatar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bodyType }),
  });
  if (!res.ok) throw new Error("Failed to update character");
  return res.json() as Promise<{ avatarConfig: AvatarConfig; avatarRenderPaths: string[] }>;
}

export async function selectFantasyOutfit(
  studentId: string,
  fantasyOutfit: string,
): Promise<{ avatarConfig: AvatarConfig; avatarRenderPaths: string[] }> {
  const res = await fetch(`/api/students/${studentId}/avatar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fantasyOutfit }),
  });
  if (!res.ok) throw new Error("Failed to apply fantasy outfit");
  return res.json() as Promise<{ avatarConfig: AvatarConfig; avatarRenderPaths: string[] }>;
}

export async function selectAvatarSlot(
  studentId: string,
  slot: AvatarSlot,
  asset: string,
): Promise<{ avatarConfig: AvatarConfig; avatarRenderPaths: string[] }> {
  const res = await fetch(`/api/students/${studentId}/avatar`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot, asset }),
  });
  if (!res.ok) throw new Error("Failed to update avatar");
  return res.json() as Promise<{ avatarConfig: AvatarConfig; avatarRenderPaths: string[] }>;
}

export function formatCurrency(amount: number): string {
  return amount.toLocaleString();
}

export function formatTransactionType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function assetLabel(filename: string): string {
  return filename
    .replace(/\.png$/i, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
