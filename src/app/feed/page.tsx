import FeedClient from "./feed-client";

export default function FeedPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Global feed</h1>
        <p className="text-sm text-zinc-600">Latest updates across all users.</p>
      </div>
      <FeedClient />
    </div>
  );
}
