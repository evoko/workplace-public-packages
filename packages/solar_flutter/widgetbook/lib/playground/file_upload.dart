// FileUpload's Playground: its files the `files` extra, their names, comma-separated (each trimmed,
// empty ones dropped). Flutter has no file picker of its own, so Browse and replace call the app's,
// `onBrowse`: logged, and the Playground stands in for the app's picker, choosing Figma's sample
// file; remove empties it (logged). Its label the `label` extra (Figma's "Upload a file"), a cleared
// one left out; mandatory while `mandatory` holds any text, as Text Input's; its helper and states
// from their controls. As the web's (stories/playground/file-upload.tsx), where the browser's own
// picker chooses.

import 'package:solar_flutter/solar_flutter.dart';

import 'playground.dart';

/// The file the Playground's stand-in picker chooses: Figma's sample name.
const _sampleFile = 'Filename.jpg';

/// The names a comma-separated text holds, trimmed, the empty ones dropped.
List<String> _namesOf(String text) => [
  for (final name in text.split(','))
    if (name.trim().isNotEmpty) name.trim(),
];

final fileUploadPlayground = SolarPlaygroundBuilder(
  build: (p) => SolarFileUpload(
    error: p.flag('error'),
    enabled: !p.flag('disabled'),
    label: p.words('label'),
    mandatory: p.words('mandatory') != null,
    helper: p.words('helper'),
    value: _namesOf(p.text('files')),
    onBrowse: () {
      p.log('onBrowse');
      p.set('files', _sampleFile);
    },
    onRemove: () {
      p.log('onRemove');
      p.set('files', '');
    },
  ),
);
