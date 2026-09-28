import { readFile } from "node:fs/promises";
import path from "node:path";

// Founder photos from the owners' deck (C-021) are not consented for the web yet (Q20). They live in the gitignored
// refs/ folder and are served here in development only, so the owners can review the About page on localhost; a
// production build answers 404 and nothing is committed or shipped (D-032).
export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  if (process.env.NODE_ENV === "production" || !/^[a-z]+\.webp$/.test(file)) {
    return new Response(null, { status: 404 });
  }
  try {
    const body = await readFile(path.join(process.cwd(), "refs", "care-setu", "founders", file));
    return new Response(body, { headers: { "Content-Type": "image/webp", "Cache-Control": "no-store" } });
  } catch {
    return new Response(null, { status: 404 });
  }
}
