import GamePlayer from "./GamePlayer";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GamePlayer id={id} />;
}
