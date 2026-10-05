import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

// WCAG 2.1 A and AA over the whole page. Two sets of aria-hidden decoration are left out on purpose: the Services deck's
// card numerals (D-031) and the Partner check-folders' ghost words (D-038), both set faint by design. WCAG 1.4.3
// exempts pure decoration, and the real text beside each carries the meaning. Everything else is checked.
const decorative = ['[class*="ServiceDeck-module"][class*="__idx"]', '[class*="CheckFile-module"][class*="__ghost"]'];

async function scan(page: Page): Promise<string[]> {
  let builder = new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]);
  for (const selector of decorative) builder = builder.exclude(selector);
  const { violations } = await builder.analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
}

// A colour caught mid-transition (a chosen option, a step changing) is not what a visitor is left looking at, so a finding
// must still be there on the next looks, up to about 1.5 s later, before it counts. A real contrast fault never goes away.
export async function violations(page: Page): Promise<string[]> {
  let found = await scan(page);
  for (let look = 0; look < 3 && found.length; look++) {
    await page.waitForTimeout(500);
    found = await scan(page);
  }
  return found;
}
