import { getServerUser } from "@/lib/auth";
import ProfileClient from "./profile-client";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const viewer = await getServerUser();

  return (
    <ProfileClient
      handle={handle}
      canEdit={viewer?.handle === handle}
      viewerHandle={viewer?.handle ?? null}
    />
  );
}
