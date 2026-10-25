export interface ParsedKbSection {
  id: string;
  path: string;
  entryTitle: string;
  heading?: string;
  plainText: string;
  lines: string[];
  hasTable: boolean;
  sourceTitle?: string;
}

export interface ParsedKbEntry {
  path: string;
  title: string;
  sections: ParsedKbSection[];
  sources: string[];
}

/**
 * Parses outline markdown returned by initial_context tool or /initial-context HTTP endpoint.
 */
export function parseOutline(outlineText: string): { kbId: string; paths: string[] } {
  let kbId = "kbHPPfGlUOvp";
  const kbMatch = outlineText.match(/Knowledge base id:\s*`?([a-zA-Z0-9]+)`?/i);
  if (kbMatch) {
    kbId = kbMatch[1].trim();
  }

  const paths: string[] = [];
  const lines = outlineText.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    // Matches e.g. "cancellation_and_refunds [core]" or "pets"
    const pathMatch = trimmed.match(/^([a-z0-9_]+)(?:\s+\[.*\])?$/);
    if (pathMatch && !trimmed.startsWith("#") && !trimmed.startsWith("Knowledge")) {
      paths.push(pathMatch[1]);
    }
  }

  // Fallback if parsing failed to extract known paths
  if (paths.length === 0) {
    return {
      kbId,
      paths: [
        "cancellation_and_refunds",
        "check_in_and_check_out",
        "damage_and_liability",
        "guest_conduct",
        "house_rules",
        "payments_and_fees",
        "pets",
      ],
    };
  }

  return { kbId, paths };
}

/**
 * Parses a single Markdown entry from Knowledge Base.
 * - Extracts # Title
 * - Extracts ## Sources or [^id] footnote sources
 * - Splits into sections at ## headings
 * - Excludes table sections containing '|'
 * - Cleans footnote markers [^xxx]
 */
export function parseEntry(path: string, markdown: string): ParsedKbEntry {
  const lines = markdown.split("\n");
  let title = path.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const titleLine = lines.find((l) => l.startsWith("# "));
  if (titleLine) {
    title = titleLine.replace(/^#\s+/, "").trim();
  }

  // Extract source titles from footnotes: [^id]: "..." (Source Title, line X)
  const sourcesSet = new Set<string>();
  const footnoteRegex = /\[\^([a-zA-Z0-9]+)\]:\s*"([^"]+)"\s*\(([^,)]+)/g;
  let match: RegExpExecArray | null;
  while ((match = footnoteRegex.exec(markdown)) !== null) {
    if (match[3]) {
      sourcesSet.add(match[3].trim());
    }
  }

  // Also check ## Sources section if present
  const sourcesSectionIdx = lines.findIndex((l) => l.trim().startsWith("## Sources"));
  if (sourcesSectionIdx !== -1) {
    for (let i = sourcesSectionIdx + 1; i < lines.length; i++) {
      const l = lines[i].trim();
      const sMatch = l.match(/^\d+\.\s*(.*?)(?:\s*—.*)?$/);
      if (sMatch) {
        sourcesSet.add(sMatch[1].trim());
      }
    }
  }

  // Remove footnote definitions from body for sectioning
  const bodyText = markdown.replace(/\[\^[a-zA-Z0-9]+\]:.*$/gm, "").trim();

  // Split into raw sections by ## Heading
  const rawParts = bodyText.split(/(?=\n## )/);
  const sections: ParsedKbSection[] = [];

  rawParts.forEach((part, idx) => {
    const trimmedPart = part.trim();
    if (!trimmedPart || trimmedPart.startsWith("## Sources")) {
      return;
    }

    let heading: string | undefined;
    let content = trimmedPart;

    if (content.startsWith("## ")) {
      const firstLineEnd = content.indexOf("\n");
      if (firstLineEnd !== -1) {
        heading = content.substring(3, firstLineEnd).trim();
        content = content.substring(firstLineEnd + 1).trim();
      } else {
        heading = content.substring(3).trim();
        content = "";
      }
    } else if (content.startsWith("# ")) {
      // Intro section before first ##
      const firstLineEnd = content.indexOf("\n");
      if (firstLineEnd !== -1) {
        content = content.substring(firstLineEnd + 1).trim();
      }
    }

    // Exclude sections with tables
    const hasTable = content.includes("|") && /\n\|.*\|/.test(content);
    if (hasTable) {
      return;
    }

    // Clean inline footnote markers [^xyz] or [1]
    const cleanContent = content
      .replace(/\[\^[a-zA-Z0-9]+\]/g, "")
      .replace(/\[\d+\]/g, "")
      .replace(/[*_]{2}(.*?)[*_]{2}/g, "$1") // strip bold markers for plain text
      .trim();

    if (!cleanContent) {
      return;
    }

    const sectionLines = cleanContent
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("---"));

    // Find likely source for this section from footnotes in original text
    let matchedSource: string | undefined;
    for (const s of sourcesSet) {
      if (part.includes(s)) {
        matchedSource = s;
        break;
      }
    }
    if (!matchedSource && sourcesSet.size === 1) {
      matchedSource = Array.from(sourcesSet)[0];
    }

    sections.push({
      id: `kb:${path}#${idx}`,
      path,
      entryTitle: title,
      heading,
      plainText: cleanContent,
      lines: sectionLines,
      hasTable: false,
      sourceTitle: matchedSource,
    });
  });

  return {
    path,
    title,
    sections,
    sources: Array.from(sourcesSet),
  };
}
