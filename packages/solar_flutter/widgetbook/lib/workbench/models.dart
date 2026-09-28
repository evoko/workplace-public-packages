// The workbench service's answers, as the web's client types them (stories/workbench/client.ts):
// the HTTP contract in docs/engineering/architecture.md, The workbench.

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
      message = j['message'] as String?,
      json = Map.unmodifiable(j);

  final String platform;
  final String? variant, layer, property, message;
  final Object? figma, drawn;
  final bool _hasFigma, _hasDrawn;

  /// The failure as the service gave it: what Send to agent sends back.
  final Map<String, dynamic> json;

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
      was = j['was'] as String?,
      reason = j['reason'] as String?,
      deletes = j['deletes'] as bool,
      previousReason = j['previousReason'] as String?,
      failing = (j['failing'] as List?)
          ?.map((f) => WorkbenchFailure.fromJson((f as Map).cast()))
          .toList(),
      borrowers = ((j['borrowers'] as List?) ?? const []).cast<String>();

  final String component, key;
  final Map<String, Object?> value;

  /// What the variant in view drew before the edit (the entry as explain reads it), or null.
  final String? was;

  /// The reason written with it; null for a deleted rule.
  final String? reason;
  final bool deletes;
  final String? previousReason;
  final List<WorkbenchFailure>? failing;

  /// The rules that borrow the entry's reason (`reason: { as: set <key> }`), whose reason Keep
  /// therefore changes too.
  final List<String> borrowers;

  /// The value set: a token's name, a keyword, or `none`.
  String get valueText =>
      '${value['token'] ?? value['keyword'] ?? (value['none'] == true ? 'none' : '')}';

  /// The edit in one line: its key, what it drew before where the service says, and what it sets
  /// (Figma's value where it deletes the rule).
  String get text =>
      'Pending: $key${was == null || deletes ? '' : ': $was'} → ${deletes ? "Figma's value (the rule is removed)" : valueText}';
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
      seq = j['seq'] as int?,
      pending = j['pending'] == null
          ? null
          : WorkbenchPending.fromJson((j['pending'] as Map).cast()),
      reopen = switch (j['reopen']) {
        final Map<Object?, Object?> r => (
          platform: r['platform'] as String,
          component: r['component'] as String,
          variant: r['variant'] as int,
          layer: r['layer'] as String,
          cell: r['cell'] as String?,
          age: r['age'] as int,
        ),
        _ => null,
      },
      components = (j['components'] as Map).map(
        (k, v) =>
            MapEntry(k as String, ComponentStatus.fromJson((v as Map).cast())),
      );

  /// What the service is doing, or null (always null in the answer to a POST).
  final String? busy;

  /// The last event the service sent before this status was read: where the first long-poll
  /// starts, so it hears no earlier job's reload.
  final int? seq;
  final WorkbenchPending? pending;

  /// Where the viewer that saved, kept again or undid an edit was, named for 60 s after the
  /// service regenerated ([age] in ms): a viewer starting again in that time reopens its dialog
  /// there. Null elsewhere.
  final ({
    String platform,
    String component,
    int variant,
    String layer,
    String? cell,
    int age,
  })?
  reopen;
  final Map<String, ComponentStatus> components;
}

/// A scope a set may be keyed on: its plain words (`every md`, `primary · at rest`), its key, how
/// many variants a set there would change (of those that draw the layer), the recipe position of
/// the entry that overrides it in the variant in view and that entry's scope in plain words (or
/// null), and whether the entry in view is set here now.
typedef WorkbenchScope = ({
  String label,
  String key,
  int count,
  String? wins,
  String? winsLabel,
  bool current,
  WorkbenchRule? rule,
});

/// The `set` rule the overlay has at a scope's key: its reason (null where it borrows another's),
/// the rules that borrow its reason, and Figma's own value there (a set value), which chosen
/// removes the rule; null where Figma's is no value a draft can send.
typedef WorkbenchRule = ({
  String? reason,
  List<String> borrowers,
  Map<String, Object?>? figma,
});

/// One cell of a layer in a variant: its entry and value, where it comes from, the looks a rule may
/// be keyed on, and what it may be set to.
class WorkbenchCell {
  WorkbenchCell.fromJson(Map<String, dynamic> j)
    : cell = j['cell'] as String,
      entry = j['entry'] as String,
      value = j['value'] as String,
      total = j['total'] as int,
      at = j['at'] as String?,
      origin = j['origin'] as String,
      reason = j['reason'] as String?,
      scopes = [
        for (final s in j['scopes'] as List)
          (
            label: (s as Map)['label'] as String,
            key: s['key'] as String,
            count: s['count'] as int,
            wins: s['wins'] as String?,
            winsLabel: s['winsLabel'] as String?,
            current: s['current'] as bool,
            rule: switch (s['rule']) {
              final Map<Object?, Object?> r => (
                reason: r['reason'] as String?,
                borrowers: ((r['borrowers'] as List?) ?? const [])
                    .cast<String>(),
                figma: (r['figma'] as Map?)?.cast<String, Object?>(),
              ),
              _ => null,
            },
          ),
      ],
      choices = [
        for (final c in j['choices'] as List)
          (name: (c as Map)['name'] as String, value: c['value'] as String),
      ],
      keywords = (j['keywords'] as List).cast<String>(),
      none = j['none'] as bool,
      note = j['note'] as String?;

  final String cell, entry;

  /// The entry as a person reads it: a token's value, a literal, a keyword, `none`.
  final String value;

  /// How many variants the component has: what a scope's count is out of.
  final int total;
  final String? at;

  /// Where the entry comes from: `figma`, `rule` or `defaults`.
  final String origin;

  /// The rule's or the default's reason, where one sets the entry.
  final String? reason;
  final List<WorkbenchScope> scopes;
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
      parent = j['parent'] as String?,
      hidden = j['hidden'] as bool,
      cells = [
        for (final c in j['cells'] as List)
          WorkbenchCell.fromJson((c as Map).cast()),
      ];

  final String name;

  /// The nearest layer the variant draws that this one sits in; null for the root.
  final String? parent;
  final bool hidden;
  final List<WorkbenchCell> cells;
}

/// One variant of the component: its oracle index, Figma's name, and its value on each axis.
typedef WorkbenchVariant = ({
  int index,
  String name,
  Map<String, String> parts,
});

class WorkbenchInspection {
  WorkbenchInspection.fromJson(Map<String, dynamic> j)
    : component = j['component'] as String,
      revision = j['revision'] as String,
      variant = j['variant'] as int,
      axes = [
        for (final a in j['axes'] as List)
          (
            name: (a as Map)['name'] as String,
            values: (a['values'] as List).cast<String>(),
          ),
      ],
      variants = [
        for (final v in j['variants'] as List)
          (
            index: (v as Map)['index'] as int,
            name: v['name'] as String,
            parts: (v['parts'] as Map).cast<String, String>(),
          ),
      ],
      layers = [
        for (final l in j['layers'] as List)
          WorkbenchLayer.fromJson((l as Map).cast()),
      ];

  final String component, revision;
  final int variant;

  /// Each variant axis in Figma's spelling, and its values in the order the variants draw them.
  final List<({String name, List<String> values})> axes;
  final List<WorkbenchVariant> variants;
  final List<WorkbenchLayer> layers;

  /// The variant in view, where the inspection lists it.
  WorkbenchVariant? get current =>
      variants.where((v) => v.index == variant).firstOrNull;
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
