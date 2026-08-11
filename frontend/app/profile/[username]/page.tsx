import {
  getPublicProfile,
} from "@/lib/api/users";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function PublicProfilePage({
  params,
}: PageProps) {

  const {
    username,
  } = await params;

  const user =
    await getPublicProfile(username);

  return (
    <main>
      <h1>
        {user.firstName}{" "}
        {user.lastName ?? ""}
      </h1>

      <p>
        @{user.username}
      </p>

      {user.bio && (
        <p>{user.bio}</p>
      )}

      {user.location && (
        <p>{user.location}</p>
      )}
    </main>
  );
}