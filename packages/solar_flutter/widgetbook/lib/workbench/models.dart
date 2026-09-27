// The workbench service's answers, as the web's client types them (stories/workbench/client.ts):
// the HTTP contract in docs/superpowers/plans/2026-09-27-viewer-workbench.md.

import 'dart:convert';

/// A check that failed: a measured difference from Figma, or a message.
class WorkbenchFailure {
  WorkbenchFailure.fromJson(Map<String, dynamic> j)
    : platform = j['platform'] as String,
      variant = j['variant'] as String?,
      layer = j['layer'] as String?,
      property = j['property'] as String?,
      figma = j['figma'],
      drawn = j['drawn'],
      _hasFigma = j.containsKey('figma'),
      _hasDrawn = j.containsKey('drawn'),
      message = j['message'] as String?;

  final String platform;
  final String? variant, layer, property, message;
  final Object? figma, drawn;
  final bool _hasFigma, _hasDrawn;

  /// The failure in one line, as the web's list writes it: its message, else
  /// `<platform>: <variant> <layer>.<property>: Figma <figma>, drawn <drawn>`, each part left out
  /// where the failure has none.
  String get text {
    if (message case final m? when m.isNotEmpty) return m;
    final at = [
      layer,
      property,
    ].where((p) => p != null && p.isNotEmpty).join('.');
    final where = [
      variant,
      at,
    ].where((p) => p != null && p.isNotEmpty).join(' ');
    final seen = [
      if (_hasFigma) 'Figma ${jsonEncode(figma)}',
      if (_hasDrawn) 'drawn ${jsonEncode(drawn)}',
    ].join(', ');
    return [platform, where, seen].where((p) => p.isNotEmpty).join(': ');
  }
}

/// The one pending edit in the repository: an overlay `set` entry awaiting Keep or Undo.
class WorkbenchPending {
  WorkbenchPending.fromJson(Map<String, dynamic> j)
    : component = j['component'] as String,
      key = j['key'] as String,
      value = (j['value'] as Map).cast<String, Object?>(),
      deletes = j['deletes'] as bool,
      previousReason = j['previousReason'] as String?,
      failing = (j['failing'] as List?)
          ?.map((f) => WorkbenchFailure.fromJson((f as Map).cast()))
          .toList(),
      borrowers = ((j['borrowers'] as List?) ?? const []).cast<String>();

  final String component, key;
  final Map<String, Object?> value;
  final bool deletes;
  final String? previousReason;
  final List<WorkbenchFailure>? failing;

  /// The rules that borrow the entry's reason (`reason: { as: set <key> }`), whose reason Keep
  /// therefore changes too.
  final List<String> borrowers;

  /// The value set: a token's name, a keyword, or `none`.
  String get valueText =>
      '${value['token'] ?? value['keyword'] ?? (value['none'] == true ? 'none' : '')}';
}

/// What a component may do, from its circles on both platforms.
class ComponentStatus {
  ComponentStatus.fromJson(Map<String, dynamic> j)
    : web = j['web'] as String?,
      flutter = j['flutter'] as String?,
      waitsOn = (j['waitsOn'] as Map).map(
        (k, v) => MapEntry(k as String, (v as List).cast<String>()),
      ),
      editable = j['editable'] as bool,
      locked = j['locked'] as String?;

  final String? web, flutter, locked;
  final Map<String, List<String>> waitsOn;
  final bool editable;

  /// The circle on [platform]: `green`, `yellow`, `red`, or null where it has no such component.
  String? colourOn(String platform) => platform == 'web' ? web : flutter;
}

class WorkbenchStatus {
  WorkbenchStatus.fromJson(Map<String, dynamic> j)
    : busy = j['busy'] as String?,
      pending = j['pending'] == null
          ? null
          : WorkbenchPending.fromJson((j['pending'] as Map).cast()),
      components = (j['components'] as Map).map(
        (k, v) =>
            MapEntry(k as String, ComponentStatus.fromJson((v as Map).cast())),
      );

  /// What the service is doing, or null (always null in the answer to a POST).
  final String? busy;
  final WorkbenchPending? pending;
  final Map<String, ComponentStatus> components;
}

/// One cell of a layer in a variant: its entry, the looks a rule may be keyed on, and what it may
/// be set to.
class WorkbenchCell {
  WorkbenchCell.fromJson(Map<String, dynamic> j)
    : cell = j['cell'] as String,
      entry = j['entry'] as String,
      at = j['at'] as String?,
      scopes = [
        for (final s in j['scopes'] as List)
          (label: (s as Map)['label'] as String, key: s['key'] as String),
      ],
      choices = [
        for (final c in j['choices'] as List)
          (name: (c as Map)['name'] as String, value: c['value'] as String),
      ],
      keywords = (j['keywords'] as List).cast<String>(),
      none = j['none'] as bool,
      note = j['note'] as String?;

  final String cell, entry;
  final String? at;
  final List<({String label, String key})> scopes;
  final List<({String name, String value})> choices;
  final List<String> keywords;
  final bool none;

  /// Why the cell offers nothing (a raw value the overlay allows), where it says; it then offers
  /// nothing.
  final String? note;
}

class WorkbenchLayer {
  WorkbenchLayer.fromJson(Map<String, dynamic> j)
    : name = j['name'] as String,
      hidden = j['hidden'] as bool,
      cells = [
        for (final c in j['cells'] as List)
          WorkbenchCell.fromJson((c as Map).cast()),
      ];

  final String name;
  final bool hidden;
  final List<WorkbenchCell> cells;
}

class WorkbenchInspection {
  WorkbenchInspection.fromJson(Map<String, dynamic> j)
    : component = j['component'] as String,
      revision = j['revision'] as String,
      variant = j['variant'] as int,
      variants = [
        for (final v in j['variants'] as List)
          (index: (v as Map)['index'] as int, name: v['name'] as String),
      ],
      layers = [
        for (final l in j['layers'] as List)
          WorkbenchLayer.fromJson((l as Map).cast()),
      ];

  final String component, revision;
  final int variant;
  final List<({int index, String name})> variants;
  final List<WorkbenchLayer> layers;
}

/// Keep's and Approve's answer: done, or the checks that failed.
class WorkbenchOutcome {
  WorkbenchOutcome.fromJson(Map<String, dynamic> j)
    : ok = j['ok'] as bool,
      failures = [
        for (final f in (j['failures'] as List?) ?? const [])
          WorkbenchFailure.fromJson((f as Map).cast()),
      ];

  final bool ok;
  final List<WorkbenchFailure> failures;
}
