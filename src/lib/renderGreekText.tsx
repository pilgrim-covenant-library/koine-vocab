import React from 'react';

/**
 * Renders Greek text with bold markdown (**word**) converted to underlined bold.
 *
 * This utility parses inline markdown bold syntax and converts it to <strong>
 * elements with underline styling to match question descriptions that refer to
 * "the underlined verb" or "the underlined word".
 *
 * @param text - Greek text potentially containing **bold** markers
 * @returns React fragments with bold sections rendered as underlined <strong> elements
 *
 * @example
 * renderGreekWithBold('ὃ ἐὰν λύσῃς ἐπὶ τῆς γῆς **ἔσται** λελυμένον')
 * // Returns: "ὃ ἐὰν λύσῃς ἐπὶ τῆς γῆς <strong class="underline">ἔσται</strong> λελυμένον"
 */
export function renderGreekWithBold(text: string): React.ReactNode {
  // Split by **bold** markers, keeping the markers in the result
  const parts = text.split(/(\*\*.*?\*\*)/);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Remove asterisks and render bold with underline
      const content = part.slice(2, -2);
      return (
        <strong
          key={index}
          className="underline decoration-2 underline-offset-4"
        >
          {content}
        </strong>
      );
    }
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}
