/**
 * Sample content more than one Playground builder shows: content, never a design value. As
 * Flutter's (widgetbook/lib/playground/samples.dart).
 */

/** A stand-in picture: one grey pixel, which loads at once (a Dialog's image, an Avatar's photo). */
export const picture =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNoaGj4DwAFhAKAjM1mJgAAAABJRU5ErkJggg==';

/** A picker's sample options: a Select's and a Dropdown's (their `value` extras' options). */
export const options = ['Option 1', 'Option 2', 'Option 3'];

/** An Autocomplete's sample suggestions, each holding an "n" (Autocomplete Open's query). */
export const cities = ['Berlin', 'Copenhagen', 'Dublin', 'Edinburgh', 'London'];

/** A context menu's sample actions and their shortcuts, before its destructive Delete. */
export const actions: Array<[string, string]> = [
  ['Cut', '⌘X'],
  ['Copy', '⌘C'],
  ['Paste', '⌘V'],
];

/** A list's sample rows. */
export const rows = ['Inbox', 'Drafts', 'Sent'];

/** An options list's sample rows: the ways to be notified. */
export const channels = ['Email', 'SMS', 'Push'];

/** A card's More menu's sample actions. */
export const moreActions = ['Edit', 'Duplicate', 'Delete'];

/** A Tabs strip's sample tabs (Tabs' `selected` extra's options). */
export const tabs = ['Overview', 'Activity', 'Settings'];

/** A breadcrumb trail's sample pages, from the top: up to seven, past five collapsing. */
export const pages = [
  'Home',
  'Spaces',
  'Building A',
  'Floor 2',
  'Room 201',
  'Displays',
  'Display 3',
];

/** A Stepper's sample steps, the first two always shown, the last three by its step toggles. */
export const steps = ['Account', 'Profile', 'Devices', 'Review', 'Done'];

/** A Launch Card Full Screen's sample features, as Figma words them. */
export const features = [
  'Feature example 01',
  'Feature example 02',
  'Feature example 03',
];

/** A table's sample columns, its header row's words. */
export const columns = ['Name', 'Status', 'Location'];

/** A table's sample rows, each its words by column: the devices of a room. */
export const devices: Array<[string, string, string]> = [
  ['Display 1', 'Online', 'Room 201'],
  ['Display 2', 'Offline', 'Room 202'],
  ['Display 3', 'Online', 'Lobby'],
];

/** A day's sample events: its title, when it starts and its category. */
export const events: Array<[string, string, 'blue' | 'green' | 'yellow']> = [
  ['Team standup', '9:00', 'blue'],
  ['Design review', '11:00', 'green'],
  ['Lunch', '12:30', 'yellow'],
];

/** A chart's sample series, the first named by a Playground's own words where it has some. */
export const series = ['Active users', 'Sessions', 'Bookings', 'Check-ins'];

/** A chart's sample values at one point, by series, formatted. */
export const seriesValues = ['60.4k', '42.7k', '18.9k'];
