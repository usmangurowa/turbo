import { readFile } from "node:fs/promises";
import path from "node:path";

import { fromRoot, walkFiles } from "./_lib.mjs";

const SOURCE_ROOTS = [
  "apps/web/src",
  "apps/mobile/src",
  "packages/ui/src/components",
];

const VENDORED_WEB_PRIMITIVES = new Set(
  [
    "accordion",
    "alert-dialog",
    "alert",
    "aspect-ratio",
    "avatar",
    "badge",
    "breadcrumb",
    "button-group",
    "button",
    "calendar",
    "card",
    "carousel",
    "chart",
    "checkbox",
    "collapsible",
    "combobox",
    "command",
    "context-menu",
    "dialog",
    "direction",
    "drawer",
    "dropdown-menu",
    "empty",
    "field",
    "hover-card",
    "input-group",
    "input-otp",
    "input",
    "item",
    "kbd",
    "label",
    "menubar",
    "native-select",
    "navigation-menu",
    "pagination",
    "popover",
    "progress",
    "radio-group",
    "resizable",
    "scroll-area",
    "select",
    "separator",
    "sheet",
    "sidebar",
    "skeleton",
    "slider",
    "sonner",
    "spinner",
    "switch",
    "table",
    "tabs",
    "textarea",
    "toggle-group",
    "toggle",
    "tooltip",
  ].map((name) => `packages/ui/src/components/${name}.tsx`),
);

const COMPONENT_EXPORTS = {
  card: new Set([
    "Card",
    "CardHeader",
    "CardTitle",
    "CardDescription",
    "CardAction",
    "CardContent",
    "CardFooter",
  ]),
  dialog: new Set([
    "DialogContent",
    "DialogHeader",
    "DialogTitle",
    "DialogDescription",
    "DialogFooter",
  ]),
  sheet: new Set([
    "SheetContent",
    "SheetHeader",
    "SheetTitle",
    "SheetDescription",
    "SheetFooter",
  ]),
  drawer: new Set([
    "DrawerContent",
    "DrawerHeader",
    "DrawerTitle",
    "DrawerDescription",
    "DrawerFooter",
  ]),
  avatar: new Set(["Avatar", "AvatarImage", "AvatarFallback"]),
  button: new Set(["Button"]),
};

const CARD_SLOTS = new Set(["CardHeader", "CardContent", "CardFooter"]);
const CARD_HEADER_SLOTS = new Set([
  "CardTitle",
  "CardDescription",
  "CardAction",
]);
const ICON_BUTTON_SIZES = new Set(["icon", "icon-xs", "icon-sm", "icon-lg"]);

const RAW_COLOR_CLASS =
  /\b((?:bg|text|border|ring|outline|decoration|fill|stroke|from|via|to)-(?:black|white|slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)(?:-\d{2,3})?(?:\/\d{1,3})?)\b/g;
const ARBITRARY_COLOR_CLASS =
  /((?:bg|text|border|ring|outline|decoration|fill|stroke|from|via|to)-\[(?:#|(?:rgb|hsl|oklch|oklab|lab|lch|color-mix)\(|color:|var\()[^\]]+\])/g;
const ARBITRARY_SPACING_CLASS =
  /((?:-?(?:m[trblxy]?|p[trblxy]?|gap(?:-[xy])?|space-[xy]|w|h|min-w|max-w|min-h|max-h|inset(?:-[xy])?|top|right|bottom|left|translate-[xy]))-\[[^\]]+\])/g;
const ARBITRARY_TYPOGRAPHY_CLASS = /((?:text|leading|tracking)-\[[^\]]+\])/g;

const lineAt = (content, index) => {
  let line = 1;
  for (let cursor = 0; cursor < index; cursor += 1) {
    if (content.charCodeAt(cursor) === 10) line += 1;
  }
  return line;
};

const shouldScan = (file) => {
  if (!/\.[jt]sx$/.test(file)) return false;
  if (file.startsWith("apps/mobile/src/components/ui/")) return false;
  if (file.startsWith("packages/ui/src/components/ai-elements/")) return false;
  if (VENDORED_WEB_PRIMITIVES.has(file)) return false;
  return true;
};

const listSourceFiles = async () => {
  const groups = await Promise.all(
    SOURCE_ROOTS.map((root) => walkFiles(root, shouldScan)),
  );
  return groups.flat().sort();
};

const parseRelevantImports = (content) => {
  const localToSemantic = new Map();
  const importPattern =
    /import\s+(?:type\s+)?\{([\s\S]*?)\}\s+from\s+["']([^"']+)["'];?/g;

  for (const match of content.matchAll(importPattern)) {
    const sourceName = match[2].split("/").at(-1);
    const supportedExports = COMPONENT_EXPORTS[sourceName];
    if (!supportedExports) continue;

    for (const rawSpecifier of match[1].split(",")) {
      const specifier = rawSpecifier.trim().replace(/^type\s+/, "");
      if (!specifier) continue;
      const [imported, local = imported] = specifier.split(/\s+as\s+/);
      if (supportedExports.has(imported)) {
        localToSemantic.set(local, imported);
      }
    }
  }

  return localToSemantic;
};

const canStartString = (content, index) => {
  let cursor = index - 1;
  while (cursor >= 0 && /\s/.test(content[cursor])) cursor -= 1;
  if (cursor < 0) return true;
  if (/[=([{,:;!?&|+\-*%^~]/.test(content[cursor])) return true;
  if (content.slice(Math.max(0, cursor - 1), cursor + 1) === "=>") return true;
  return /\b(?:return|case|throw)\s*$/.test(content.slice(0, index));
};

const maskCommentsAndCodeStrings = (content) => {
  const masked = [...content];
  let mode = "code";
  let quote;
  let escaped = false;

  const hide = (index) => {
    if (masked[index] !== "\n" && masked[index] !== "\r") masked[index] = " ";
  };

  for (let index = 0; index < content.length; index += 1) {
    const character = content[index];
    const next = content[index + 1];

    if (mode === "line-comment") {
      if (character === "\n") {
        mode = "code";
      } else {
        hide(index);
      }
      continue;
    }
    if (mode === "block-comment") {
      hide(index);
      if (character === "*" && next === "/") {
        hide(index + 1);
        index += 1;
        mode = "code";
      }
      continue;
    }
    if (mode === "string") {
      hide(index);
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        mode = "code";
        quote = undefined;
      }
      continue;
    }

    if (character === "/" && next === "/") {
      hide(index);
      hide(index + 1);
      index += 1;
      mode = "line-comment";
      continue;
    }
    if (character === "/" && next === "*") {
      hide(index);
      hide(index + 1);
      index += 1;
      mode = "block-comment";
      continue;
    }
    if (
      (character === '"' || character === "'" || character === "`") &&
      canStartString(content, index)
    ) {
      hide(index);
      mode = "string";
      quote = character;
    }
  }

  return masked.join("");
};

const findTagEnd = (content, start) => {
  let quote;
  let escaped = false;
  let braceDepth = 0;

  for (let index = start; index < content.length; index += 1) {
    const character = content[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = undefined;
      }
      continue;
    }

    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") {
      braceDepth += 1;
      continue;
    }
    if (character === "}") {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }
    if (character === ">" && braceDepth === 0) return index;
  }

  return -1;
};

const parseElements = (content, localToSemantic) => {
  const elements = [];
  const stack = [];
  const tagPattern = /<\s*(\/?)\s*([A-Za-z_$][\w$.-]*)/g;
  const scanContent = maskCommentsAndCodeStrings(content);

  for (const match of scanContent.matchAll(tagPattern)) {
    const localName = match[2];
    const semantic = localToSemantic.get(localName);
    if (!semantic) continue;

    const tagEnd = findTagEnd(scanContent, match.index + match[0].length);
    if (tagEnd === -1) continue;

    if (match[1]) {
      const openIndex = stack.findLastIndex(
        (element) => element.localName === localName,
      );
      if (openIndex === -1) continue;
      const [element] = stack.splice(openIndex, 1);
      element.closeStart = match.index;
      element.end = tagEnd + 1;
      continue;
    }

    const openingTag = content.slice(match.index, tagEnd + 1);
    const selfClosing = /\/\s*>$/.test(openingTag);
    const element = {
      localName,
      semantic,
      start: match.index,
      openEnd: tagEnd,
      closeStart: selfClosing ? tagEnd : undefined,
      end: selfClosing ? tagEnd + 1 : content.length,
      attributes: content.slice(
        match.index + match[0].length,
        selfClosing ? tagEnd - 1 : tagEnd,
      ),
      selfClosing,
    };
    elements.push(element);
    if (!selfClosing) stack.push(element);
  }

  return elements;
};

const contains = (parent, child) =>
  child.start > parent.openEnd && child.end <= parent.end;

const nearestContainer = (element, candidates) =>
  candidates
    .filter((candidate) => contains(candidate, element))
    .sort((left, right) => right.start - left.start)[0];

const descendants = (element, elements, semantic) =>
  elements.filter(
    (candidate) =>
      candidate.semantic === semantic && contains(element, candidate),
  );

const findConditionalGroups = (content) => {
  const scanContent = maskCommentsAndCodeStrings(content);
  const braceStack = [];
  const blocks = [];

  for (let index = 0; index < scanContent.length; index += 1) {
    if (scanContent[index] === "{") braceStack.push(index);
    if (scanContent[index] === "}" && braceStack.length > 0) {
      blocks.push({ start: braceStack.pop(), end: index });
    }
  }

  const groups = [];
  for (const block of blocks) {
    let roundDepth = 0;
    let squareDepth = 0;
    let curlyDepth = 0;
    let question = -1;
    let logical = -1;
    const firstJsx = scanContent.indexOf("<", block.start + 1);
    const operatorLimit =
      firstJsx === -1 || firstJsx > block.end ? block.end : firstJsx;

    for (let index = block.start + 1; index < operatorLimit; index += 1) {
      const character = scanContent[index];
      const next = scanContent[index + 1];
      if (character === "(") roundDepth += 1;
      if (character === ")") roundDepth -= 1;
      if (character === "[") squareDepth += 1;
      if (character === "]") squareDepth -= 1;
      if (character === "{") curlyDepth += 1;
      if (character === "}") curlyDepth -= 1;
      if (roundDepth !== 0 || squareDepth !== 0 || curlyDepth !== 0) continue;

      if (
        character === "?" &&
        next !== "?" &&
        next !== "." &&
        scanContent[index - 1] !== "?"
      ) {
        question = index;
        break;
      }
      if (character === "&" && next === "&") logical = index;
    }

    if (question !== -1) {
      roundDepth = 0;
      squareDepth = 0;
      curlyDepth = 0;
      let colon = -1;
      for (let index = question + 1; index < block.end; index += 1) {
        const character = scanContent[index];
        if (character === "(") roundDepth += 1;
        if (character === ")") roundDepth -= 1;
        if (character === "[") squareDepth += 1;
        if (character === "]") squareDepth -= 1;
        if (character === "{") curlyDepth += 1;
        if (character === "}") curlyDepth -= 1;
        if (
          character === ":" &&
          roundDepth === 0 &&
          squareDepth === 0 &&
          curlyDepth === 0
        ) {
          colon = index;
          break;
        }
      }
      if (colon !== -1) {
        groups.push({
          start: block.start,
          end: block.end + 1,
          branches: [
            { start: question + 1, end: colon },
            { start: colon + 1, end: block.end },
          ],
        });
      }
      continue;
    }

    if (logical !== -1) {
      groups.push({
        start: block.start,
        end: block.end + 1,
        branches: [
          { start: logical + 2, end: block.end },
          { start: block.end, end: block.end },
        ],
      });
    }
  }

  return groups;
};

const rangeContains = (outer, inner) =>
  inner.start >= outer.start && inner.end <= outer.end;

const possibleSequences = (range, candidates, groups) => {
  const containedGroups = groups.filter((group) => rangeContains(range, group));
  const topLevelGroups = containedGroups.filter(
    (group) =>
      !containedGroups.some(
        (other) => other !== group && rangeContains(other, group),
      ),
  );
  const directCandidates = candidates.filter(
    (candidate) =>
      candidate.start >= range.start &&
      candidate.end <= range.end &&
      !topLevelGroups.some((group) => rangeContains(group, candidate)),
  );
  const items = [
    ...directCandidates.map((element) => ({
      start: element.start,
      sequences: [[element]],
    })),
    ...topLevelGroups.map((group) => ({
      start: group.start,
      sequences: group.branches.flatMap((branch) =>
        possibleSequences(branch, candidates, groups),
      ),
    })),
  ].sort((left, right) => left.start - right.start);

  let sequences = [[]];
  for (const item of items) {
    sequences = sequences.flatMap((prefix) =>
      item.sequences.map((suffix) => [...prefix, ...suffix]),
    );
    if (sequences.length > 64) {
      sequences = sequences.slice(0, 64);
    }
  }

  const unique = new Map(
    sequences.map((sequence) => [
      sequence
        .map((element) => `${element.semantic}@${element.start}`)
        .join("|"),
      sequence,
    ]),
  );
  return [...unique.values()];
};

const productionsFor = (sequences) =>
  [
    ...new Set(
      sequences.map(
        (sequence) =>
          sequence.map((element) => element.semantic).join(" > ") || "(empty)",
      ),
    ),
  ].sort();

const addFinding = (
  findings,
  file,
  content,
  elementOrIndex,
  severity,
  rule,
  message,
) => {
  const index =
    typeof elementOrIndex === "number" ? elementOrIndex : elementOrIndex.start;
  findings.push({
    file,
    line: lineAt(content, index),
    severity,
    rule,
    message,
  });
};

const checkCards = (file, content, elements, conditionalGroups, findings) => {
  const cards = elements.filter((element) => element.semantic === "Card");

  for (const card of cards) {
    const nestedCards = cards.filter(
      (candidate) => candidate !== card && contains(card, candidate),
    );
    for (const nested of nestedCards.filter(
      (candidate) => nearestContainer(candidate, cards) === card,
    )) {
      addFinding(
        findings,
        file,
        content,
        nested,
        "error",
        "card-nesting",
        "Card must not be nested inside Card",
      );
    }

    const slots = elements
      .filter(
        (element) =>
          CARD_SLOTS.has(element.semantic) &&
          nearestContainer(element, cards) === card,
      )
      .sort((left, right) => left.start - right.start);
    const headers = slots.filter(
      (element) => element.semantic === "CardHeader",
    );
    const sequences = possibleSequences(
      { start: card.openEnd + 1, end: card.closeStart },
      slots,
      conditionalGroups,
    );
    const productions = productionsFor(sequences);
    if (
      sequences.some(
        (sequence) =>
          sequence.filter((element) => element.semantic === "CardHeader")
            .length !== 1,
      )
    ) {
      addFinding(
        findings,
        file,
        content,
        card,
        "error",
        "card-header",
        `Card requires exactly one CardHeader in every branch; found ${productions.join(" | ")}`,
      );
    }
    if (
      sequences.some(
        (sequence) =>
          sequence.filter((element) => element.semantic === "CardContent")
            .length !== 1,
      )
    ) {
      addFinding(
        findings,
        file,
        content,
        card,
        "error",
        "card-content",
        `Card requires exactly one CardContent in every branch; found ${productions.join(" | ")}`,
      );
    }
    if (
      sequences.some(
        (sequence) =>
          sequence.filter((element) => element.semantic === "CardFooter")
            .length > 1,
      )
    ) {
      addFinding(
        findings,
        file,
        content,
        card,
        "error",
        "card-footer",
        `Card allows at most one CardFooter in every branch; found ${productions.join(" | ")}`,
      );
    }

    if (
      sequences.some(
        (sequence) =>
          !/^(CardHeader > CardContent)( > CardFooter)?$/.test(
            sequence.map((element) => element.semantic).join(" > "),
          ),
      )
    ) {
      addFinding(
        findings,
        file,
        content,
        card,
        "error",
        "card-order",
        `Card slots must be CardHeader > CardContent > CardFooter? in every branch; found ${productions.join(" | ")}`,
      );
    }

    for (const header of headers) {
      const headerSlots = elements
        .filter(
          (element) =>
            CARD_HEADER_SLOTS.has(element.semantic) &&
            contains(header, element),
        )
        .sort((left, right) => left.start - right.start);
      const headerSequences = possibleSequences(
        { start: header.openEnd + 1, end: header.closeStart },
        headerSlots,
        conditionalGroups,
      );
      const headerProductions = productionsFor(headerSequences);
      if (
        headerSequences.some(
          (sequence) =>
            sequence.filter((element) => element.semantic === "CardTitle")
              .length !== 1,
        )
      ) {
        addFinding(
          findings,
          file,
          content,
          header,
          "error",
          "card-title",
          `CardHeader requires exactly one CardTitle in every branch; found ${headerProductions.join(" | ")}`,
        );
      }

      if (
        headerSequences.some(
          (sequence) =>
            !/^CardTitle( > CardDescription)?( > CardAction)?$/.test(
              sequence.map((element) => element.semantic).join(" > "),
            ),
        )
      ) {
        addFinding(
          findings,
          file,
          content,
          header,
          "error",
          "card-header-order",
          `CardHeader slots must be CardTitle > CardDescription? > CardAction? in every branch; found ${headerProductions.join(" | ")}`,
        );
      }
    }

    for (const element of elements.filter(
      (candidate) =>
        CARD_HEADER_SLOTS.has(candidate.semantic) &&
        nearestContainer(candidate, cards) === card,
    )) {
      if (!headers.some((header) => contains(header, element))) {
        addFinding(
          findings,
          file,
          content,
          element,
          "error",
          "card-header-slot",
          `${element.semantic} must be inside CardHeader`,
        );
      }
    }
  }
};

const checkOverlays = (
  file,
  content,
  elements,
  conditionalGroups,
  findings,
) => {
  const overlayPairs = [
    {
      content: "DialogContent",
      header: "DialogHeader",
      title: "DialogTitle",
      description: "DialogDescription",
    },
    {
      content: "SheetContent",
      header: "SheetHeader",
      title: "SheetTitle",
      description: "SheetDescription",
    },
    {
      content: "DrawerContent",
      header: "DrawerHeader",
      title: "DrawerTitle",
      description: "DrawerDescription",
    },
  ];

  for (const names of overlayPairs) {
    const overlays = elements.filter(
      (element) => element.semantic === names.content,
    );
    for (const overlay of overlays) {
      const titles = elements.filter(
        (element) =>
          element.semantic === names.title &&
          nearestContainer(element, overlays) === overlay,
      );
      const headers = elements.filter(
        (element) =>
          element.semantic === names.header &&
          nearestContainer(element, overlays) === overlay,
      );
      const titleSequences = possibleSequences(
        { start: overlay.openEnd + 1, end: overlay.closeStart },
        titles,
        conditionalGroups,
      );
      if (
        titleSequences.some(
          (sequence) =>
            sequence.filter((element) => element.semantic === names.title)
              .length !== 1,
        )
      ) {
        addFinding(
          findings,
          file,
          content,
          overlay,
          "error",
          "overlay-title",
          `${names.content} requires exactly one ${names.title} in every branch; found ${productionsFor(titleSequences).join(" | ")}; sr-only is allowed`,
        );
      }

      for (const element of elements.filter(
        (candidate) =>
          [names.title, names.description].includes(candidate.semantic) &&
          nearestContainer(candidate, overlays) === overlay,
      )) {
        if (!headers.some((header) => contains(header, element))) {
          addFinding(
            findings,
            file,
            content,
            element,
            "error",
            "overlay-header-slot",
            `${element.semantic} must be inside ${names.header}`,
          );
        }
      }
    }
  }
};

const checkAvatars = (file, content, elements, conditionalGroups, findings) => {
  const avatars = elements.filter((element) => element.semantic === "Avatar");
  for (const avatar of avatars) {
    const slots = elements
      .filter(
        (element) =>
          ["AvatarImage", "AvatarFallback"].includes(element.semantic) &&
          nearestContainer(element, avatars) === avatar,
      )
      .sort((left, right) => left.start - right.start);
    const sequences = possibleSequences(
      { start: avatar.openEnd + 1, end: avatar.closeStart },
      slots,
      conditionalGroups,
    );
    const productions = productionsFor(sequences);
    if (
      sequences.some(
        (sequence) =>
          sequence.filter((element) => element.semantic === "AvatarFallback")
            .length !== 1,
      )
    ) {
      addFinding(
        findings,
        file,
        content,
        avatar,
        "error",
        "avatar-fallback",
        `Avatar requires exactly one AvatarFallback in every branch; found ${productions.join(" | ")}`,
      );
    }

    if (
      sequences.some(
        (sequence) =>
          !/^(AvatarImage > )?AvatarFallback$/.test(
            sequence.map((element) => element.semantic).join(" > "),
          ),
      )
    ) {
      addFinding(
        findings,
        file,
        content,
        avatar,
        "error",
        "avatar-order",
        `Avatar slots must be AvatarImage? > AvatarFallback in every branch; found ${productions.join(" | ")}`,
      );
    }
  }
};

const readStaticAttribute = (attributes, name) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = attributes.match(
    new RegExp(
      String.raw`(?:^|\s)${escapedName}\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*["']([^"']*)["']\s*\})`,
    ),
  );
  return match?.[1] ?? match?.[2] ?? match?.[3];
};

const hasAttribute = (attributes, name) => {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(String.raw`(?:^|\s)${escapedName}(?:\s*=|\s|$)`).test(
    attributes,
  );
};

const hasAccessibleLabelAttribute = (attributes, name) => {
  const staticValue = readStaticAttribute(attributes, name);
  if (staticValue !== undefined) return staticValue.trim().length > 0;
  return hasAttribute(attributes, name);
};

const checkIconButtons = (file, content, elements, findings) => {
  for (const button of elements.filter(
    (element) => element.semantic === "Button",
  )) {
    const size = readStaticAttribute(button.attributes, "size");
    if (!ICON_BUTTON_SIZES.has(size)) continue;

    const hasLabel =
      hasAccessibleLabelAttribute(button.attributes, "aria-label") ||
      hasAccessibleLabelAttribute(button.attributes, "aria-labelledby") ||
      hasAccessibleLabelAttribute(button.attributes, "accessibilityLabel");
    const body = content.slice(button.openEnd + 1, button.closeStart);
    const hasScreenReaderText =
      /<span\b[^>]*className\s*=\s*(?:"[^"]*\bsr-only\b[^"]*"|'[^']*\bsr-only\b[^']*')[^>]*>[\s\S]*?\S[\s\S]*?<\/span>/.test(
        body,
      );

    if (!hasLabel && !hasScreenReaderText) {
      addFinding(
        findings,
        file,
        content,
        button,
        "error",
        "icon-button-label",
        `Button size="${size}" requires aria-label, aria-labelledby, accessibilityLabel, or meaningful sr-only text`,
      );
    }
  }
};

const checkClassPolicies = (file, content, findings) => {
  const policies = [
    {
      pattern: RAW_COLOR_CLASS,
      rule: "semantic-color",
      message: (value) =>
        `use a semantic color token instead of raw palette class "${value}"`,
    },
    {
      pattern: ARBITRARY_COLOR_CLASS,
      rule: "arbitrary-color",
      message: (value) =>
        `use a semantic color token instead of arbitrary color class "${value}"`,
    },
    {
      pattern: ARBITRARY_SPACING_CLASS,
      rule: "arbitrary-spacing",
      message: (value) =>
        `use the shared spacing scale instead of arbitrary class "${value}"`,
    },
    {
      pattern: ARBITRARY_TYPOGRAPHY_CLASS,
      rule: "arbitrary-typography",
      message: (value) =>
        `use the documented typography scale instead of arbitrary class "${value}"`,
    },
  ];

  for (const policy of policies) {
    policy.pattern.lastIndex = 0;
    for (const match of content.matchAll(policy.pattern)) {
      const value = match[1];
      const valueOffset = match[0].indexOf(value);
      addFinding(
        findings,
        file,
        content,
        match.index + valueOffset,
        "error",
        policy.rule,
        policy.message(value),
      );
    }
  }

  for (const match of content.matchAll(/\banimate-pulse\b/g)) {
    addFinding(
      findings,
      file,
      content,
      match.index,
      "error",
      "raw-loading-pulse",
      "use the Skeleton primitive instead of animate-pulse",
    );
  }
};

const checkFile = async (file) => {
  const content = await readFile(fromRoot(file), "utf8");
  const findings = [];
  const localToSemantic = parseRelevantImports(content);
  const elements = parseElements(content, localToSemantic);
  const conditionalGroups = findConditionalGroups(content);

  checkCards(file, content, elements, conditionalGroups, findings);
  checkOverlays(file, content, elements, conditionalGroups, findings);
  checkAvatars(file, content, elements, conditionalGroups, findings);
  checkIconButtons(file, content, elements, findings);
  checkClassPolicies(file, content, findings);
  return findings;
};

const main = async () => {
  const files = await listSourceFiles();
  const findings = (await Promise.all(files.map(checkFile))).flat();
  findings.sort(
    (left, right) =>
      left.file.localeCompare(right.file) ||
      left.line - right.line ||
      left.rule.localeCompare(right.rule),
  );

  for (const finding of findings) {
    const stream = finding.severity === "error" ? console.error : console.warn;
    stream(
      `${finding.file}:${finding.line}: ${finding.severity} ${finding.rule} ${finding.message}`,
    );
  }

  const errorCount = findings.filter(
    (finding) => finding.severity === "error",
  ).length;
  const warningCount = findings.length - errorCount;
  if (errorCount > 0) {
    console.error(
      `UI composition check failed with ${errorCount} error(s) and ${warningCount} warning(s).`,
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `UI composition check passed for ${files.length} authored file(s) with ${warningCount} warning(s).`,
  );
};

await main();
