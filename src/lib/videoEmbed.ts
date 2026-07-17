/** Convert YouTube / Loom / Vimeo watch URLs into embeddable iframe src. */
export function toEmbedUrl(raw: string): string {
  const input = raw.trim();
  if (!input) return "";

  try {
    const url = new URL(input);

    // Already an embed
    if (
      url.pathname.includes("/embed/") ||
      (url.hostname.includes("loom.com") && url.pathname.includes("/embed"))
    ) {
      return input;
    }

    // YouTube
    if (
      url.hostname.includes("youtube.com") ||
      url.hostname.includes("youtu.be")
    ) {
      let id = "";
      if (url.hostname.includes("youtu.be")) {
        id = url.pathname.replace(/^\//, "").split("/")[0] || "";
      } else if (url.pathname.startsWith("/shorts/")) {
        id = url.pathname.split("/")[2] || "";
      } else {
        id = url.searchParams.get("v") || "";
      }
      if (id) return `https://www.youtube.com/embed/${id}`;
    }

    // Loom
    if (url.hostname.includes("loom.com")) {
      const parts = url.pathname.split("/").filter(Boolean);
      const shareIdx = parts.indexOf("share");
      const id = shareIdx >= 0 ? parts[shareIdx + 1] : parts[parts.length - 1];
      if (id) return `https://www.loom.com/embed/${id}`;
    }

    // Vimeo
    if (url.hostname.includes("vimeo.com")) {
      const id = url.pathname.split("/").filter(Boolean).pop();
      if (id && /^\d+$/.test(id)) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    /* keep raw */
  }

  return input;
}

export function guessDocType(
  fileName: string,
): "pdf" | "doc" | "txt" | "link" {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "pdf";
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return "txt";
  if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".json")
  )
    return "doc";
  return "link";
}
