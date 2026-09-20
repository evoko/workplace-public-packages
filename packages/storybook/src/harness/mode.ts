import type { ModeSwitch } from './spec';

/**
 * Every shadow host, which carries the mode as well as the document does:
 * each cell's stylesheets are `:host`-scoped (see `styles.ts`), so a mode
 * override only reaches a cell when its own host matches.
 */
const HOSTS = '[data-parity-cell]';

function elements(): Element[] {
  return [document.documentElement, ...document.querySelectorAll(HOSTS)];
}

/** The mode this element is in, or null when it carries none. */
function modeOf(element: Element, mode: ModeSwitch): string | null {
  if (mode.kind === 'attribute') {
    return element.getAttribute(mode.name);
  }
  for (const cls of element.classList) {
    const inner = cls.length - mode.prefix.length - mode.suffix.length;
    if (inner > 0 && cls.startsWith(mode.prefix) && cls.endsWith(mode.suffix)) {
      return cls.slice(mode.prefix.length, cls.length - mode.suffix.length);
    }
  }
  return null;
}

function applyToElement(
  element: Element,
  mode: ModeSwitch,
  value: string,
): void {
  if (mode.kind === 'attribute') {
    element.setAttribute(mode.name, value);
    return;
  }
  for (const cls of [...element.classList]) {
    const inner = cls.length - mode.prefix.length - mode.suffix.length;
    if (inner > 0 && cls.startsWith(mode.prefix) && cls.endsWith(mode.suffix)) {
      element.classList.remove(cls);
    }
  }
  element.classList.add(`${mode.prefix}${value}${mode.suffix}`);
}

function clearFromElement(
  element: Element,
  mode: ModeSwitch,
  modes: readonly string[],
): void {
  if (mode.kind === 'attribute') {
    element.removeAttribute(mode.name);
    return;
  }
  for (const m of modes) {
    element.classList.remove(`${mode.prefix}${m}${mode.suffix}`);
  }
}

export function applyMode(mode: ModeSwitch, value: string): void {
  for (const element of elements()) {
    applyToElement(element, mode, value);
  }
}

export function clearMode(mode: ModeSwitch, modes: readonly string[]): void {
  for (const element of elements()) {
    clearFromElement(element, mode, modes);
  }
}

/** The mode the document is in, or null when none is set. */
export function currentMode(mode: ModeSwitch): string | null {
  return modeOf(document.documentElement, mode);
}

/** Puts a freshly mounted host into the mode the document is already in. */
export function copyModeToHost(host: Element, mode: ModeSwitch): void {
  const value = currentMode(mode);
  if (value !== null) {
    applyToElement(host, mode, value);
  }
}

/** Resolves after the next animation frame, when a mode change has reached computed styles. */
export function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}
