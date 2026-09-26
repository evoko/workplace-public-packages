// Sample content more than one Playground builder shows: content, never a design value. As the
// web's (stories/playground/samples.ts).

import 'dart:convert';

import 'package:flutter/widgets.dart';
import 'package:solar_flutter/solar_flutter.dart';

/// A stand-in picture: one grey pixel (a Dialog's image, an Avatar's photo).
final samplePicture = MemoryImage(
  base64Decode(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNoaGj4DwAFhAKAjM1mJgAAAABJRU5ErkJggg==',
  ),
);

/// A picker's sample options, as its `value` extra's dartOptions name them (a Select's and a
/// Dropdown's): none chosen, or one of three.
enum SampleOption { none, option1, option2, option3 }

/// A sample option's words, the `value` extra's option at its index.
String sampleOptionWords(SampleOption o) => 'Option ${o.index}';

/// The sample options that are a choice, in order.
final sampleOptions = SampleOption.values.skip(1).toList();

/// An Autocomplete's sample suggestions, each holding an "n" (Autocomplete Open's query).
const sampleCities = ['Berlin', 'Copenhagen', 'Dublin', 'Edinburgh', 'London'];

/// A context menu's sample actions and their shortcuts, before its destructive Delete.
const sampleActions = [('Cut', '⌘X'), ('Copy', '⌘C'), ('Paste', '⌘V')];

/// A list's sample rows.
const sampleRows = ['Inbox', 'Drafts', 'Sent'];

/// An options list's sample rows: the ways to be notified.
const sampleChannels = ['Email', 'SMS', 'Push'];

/// A card's More menu's sample actions.
const sampleMoreActions = ['Edit', 'Duplicate', 'Delete'];

/// A Tabs strip's sample tabs, as its `selected` extra's dartOptions name them.
enum SampleTab { overview, activity, settings }

/// A sample tab's words, the `selected` extra's option at its index.
String sampleTabWords(SampleTab t) =>
    const ['Overview', 'Activity', 'Settings'][t.index];

/// A breadcrumb trail's sample pages, from the top: up to seven, past five collapsing.
const samplePages = [
  'Home',
  'Spaces',
  'Building A',
  'Floor 2',
  'Room 201',
  'Displays',
  'Display 3',
];

/// A Stepper's sample steps, the first two always shown, the last three by its step toggles.
const sampleSteps = ['Account', 'Profile', 'Devices', 'Review', 'Done'];

/// A Launch Card Full Screen's sample features, as Figma words them.
const sampleFeatures = [
  'Feature example 01',
  'Feature example 02',
  'Feature example 03',
];

/// A table's sample columns, its header row's words.
const sampleColumns = ['Name', 'Status', 'Location'];

/// A table's sample rows, each its words by column: the devices of a room.
const sampleDevices = [
  ('Display 1', 'Online', 'Room 201'),
  ('Display 2', 'Offline', 'Room 202'),
  ('Display 3', 'Online', 'Lobby'),
];

/// A day's sample events: its title, when it starts and its category.
const sampleEvents = [
  ('Team standup', '9:00', SolarEventChipCategory.blue),
  ('Design review', '11:00', SolarEventChipCategory.green),
  ('Lunch', '12:30', SolarEventChipCategory.yellow),
];

/// A chart's sample series, the first named by a Playground's own words where it has some.
const sampleSeries = ['Active users', 'Sessions', 'Bookings', 'Check-ins'];

/// A chart's sample values at one point, by series, formatted.
const sampleSeriesValues = ['60.4k', '42.7k', '18.9k'];
