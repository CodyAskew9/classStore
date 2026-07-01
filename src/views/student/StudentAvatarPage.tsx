import { AvatarBuilder } from "@/components/avatar/AvatarBuilder";

export function StudentAvatarPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold">Avatar dress-up room</h1>
        <p className="mt-1 text-muted">
          Customize your fantasy hero — skin tones, outfits, and armor sets
        </p>
      </header>
      <AvatarBuilder />
    </div>
  );
}
