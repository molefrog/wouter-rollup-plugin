type RouteTransformResult = [string, RouteTransformMeta];
type RouteTransformMeta = { wild?: string };

/**
 * Transforms Next.js-alike folder routes to paths accepted by `regexparam`,
 * the pattern matching library wouter uses.
 */
export function folderPatternToWouterPath(path: string): RouteTransformResult {
  // matches [param], [[param]], [...param]
  const dynamicSegment = /\[\[?(\.\.\.)?([^\\[\]]+?)\]\]?/g;

  const meta: { wild?: string } = {};

  const transformedPath = path.replace(dynamicSegment, (segment, threeDots, name) => {
    if (name === "...") return segment; // mailformed
    const isOptional = threeDots !== undefined;

    if (segment.startsWith("[[")) {
      // wildcard segment
      meta.wild = name;
      return `*${isOptional ? "?" : ""}`;
    } else {
      return `:${name}${isOptional ? "?" : ""}`;
    }
  });

  return [transformedPath, meta];
}

const segmentRank = (seg: string | undefined) => {
  if (seg === undefined) {
    return 0;
  } else if (seg.includes("*?")) {
    return 5;
  } else if (seg.includes("*")) {
    return 4;
  } else if (seg.includes(":") && seg.includes("?")) {
    return 3;
  } else if (seg.includes(":")) {
    return 2;
  } else {
    return 1;
  }
};

export const compareRoutesBySpecificity = (lhs: string, rhs: string) => {
  const [segLhs, segRhs] = [lhs.split("/"), rhs.split("/")];

  for (let i = 0; i < Math.max(segLhs.length, segRhs.length); i++) {
    const a = segmentRank(segLhs[i]),
      b = segmentRank(segRhs[i]);

    if (a !== b) return a - b;
  }

  return String(lhs) < String(rhs) ? -1 : 1;
};
