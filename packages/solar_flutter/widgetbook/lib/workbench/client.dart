// The workbench service's client, for the bar (bar.dart): one method per route of the HTTP
// contract, as the web's (stories/workbench/client.ts). Plain HTTP and long-polling, so the same
// code runs in the browser and in widget tests (which pass a fake).

import 'dart:convert';

import 'package:http/http.dart' as http;

import 'models.dart';

/// The service's URL, given by scripts/widgetbook.mjs when it serves (`--dart-define`); empty in a
/// build and in the tests, where the bar is never drawn.
const workbenchUrl = String.fromEnvironment('SOLAR_WORKBENCH');

abstract class WorkbenchClient {
  /// Whether the workbench answers on its port: false where nothing (or another program) does, and
  /// the bar stays away. Its session may still be starting: `status` then answers 503.
  Future<bool> health();
  Future<WorkbenchStatus> status();
  Future<WorkbenchInspection> inspect(String component, int variant);

  /// Save: the draft (the [value] at [scope] on a cell of the variant in view) written with its
  /// [reason] ('' for a rule's removal), regenerated and checked; failing checks leave it pending.
  /// The service then restarts Widgetbook, whose dialog reopens where it was (status.reopen).
  Future<WorkbenchOutcome> apply({
    required String component,
    required String platform,
    required int variant,
    required String layer,
    required String cell,
    required String scope,
    required Map<String, Object?> value,
    required String revision,
    required String reason,
  });

  /// Keep again: the pending edit's checks run again.
  Future<WorkbenchOutcome> keep(String component, String platform);
  Future<WorkbenchStatus> undo(String component, String platform);
  Future<WorkbenchOutcome> approve(String component, String platform);
  Future<List<String>> unapprovePreview(String component, String platform);
  Future<List<String>> unapprove(String component, String platform);

  /// Saves a note for an agent in spec/feedback/, with the Playground's [controls] and, where given,
  /// the [layer] and [variant] chosen in Inspect: the file written.
  Future<String> report({
    required String component,
    required String platform,
    required Map<String, Object?> controls,
    String? layer,
    String? variant,
    required String note,
  });

  /// Send to agent: a note carrying the failing checks shown (a failing Keep's, or a refused
  /// Approve's), with the person's [note], even none, in spec/feedback/: the file written. After a
  /// Keep, the edit is then no longer pending.
  Future<String> send({
    required String component,
    required String platform,
    required String note,
    required List<WorkbenchFailure> failures,
  });

  /// The events after [after], within 25 seconds: the last seq, and each event's type.
  Future<({int seq, List<String> types})> events(int after);

  /// Lets go of the connections, when the Playground goes.
  void close();
}

/// A refusal or a failure: the service's one-sentence error, with the HTTP status where it gave one.
class WorkbenchException implements Exception {
  WorkbenchException(this.message, {this.status});
  final String message;
  final int? status;
  @override
  String toString() => message;
}

class HttpWorkbenchClient implements WorkbenchClient {
  /// [client] is injected in the tests (package:http/testing's MockClient).
  HttpWorkbenchClient(this.base, {http.Client? client})
    : _http = client ?? http.Client();
  final String base;
  final http.Client _http;

  Future<Map<String, dynamic>> _call(
    String path, [
    Map<String, Object?>? body,
  ]) async {
    final uri = Uri.parse('$base$path');
    final r = body == null
        ? await _http.get(uri)
        : await _http.post(
            uri,
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          );
    Map<String, dynamic>? data;
    try {
      data = (jsonDecode(r.body) as Map).cast<String, dynamic>();
    } catch (_) {
      data = null;
    }
    if (r.statusCode >= 400 || data == null) {
      throw WorkbenchException(
        '${data?['error'] ?? 'the workbench answered ${r.statusCode}'}',
        status: r.statusCode,
      );
    }
    return data;
  }

  @override
  Future<bool> health() async {
    try {
      return (await _call('/health'))['service'] == 'solar-workbench';
    } catch (_) {
      return false;
    }
  }

  @override
  void close() => _http.close();

  @override
  Future<WorkbenchStatus> status() async =>
      WorkbenchStatus.fromJson(await _call('/status'));

  @override
  Future<WorkbenchInspection> inspect(
    String component,
    int variant,
  ) async => WorkbenchInspection.fromJson(
    await _call(
      '/component?name=${Uri.encodeQueryComponent(component)}&variant=$variant',
    ),
  );

  @override
  Future<WorkbenchOutcome> apply({
    required String component,
    required String platform,
    required int variant,
    required String layer,
    required String cell,
    required String scope,
    required Map<String, Object?> value,
    required String revision,
    required String reason,
  }) async => WorkbenchOutcome.fromJson(
    await _call('/apply', {
      'component': component,
      'platform': platform,
      'variant': variant,
      'layer': layer,
      'cell': cell,
      'scope': scope,
      'value': value,
      'revision': revision,
      'reason': reason,
    }),
  );

  @override
  Future<WorkbenchOutcome> keep(String component, String platform) async =>
      WorkbenchOutcome.fromJson(
        await _call('/keep', {'component': component, 'platform': platform}),
      );

  @override
  Future<WorkbenchStatus> undo(String component, String platform) async =>
      WorkbenchStatus.fromJson(
        await _call('/undo', {'component': component, 'platform': platform}),
      );

  @override
  Future<WorkbenchOutcome> approve(String component, String platform) async =>
      WorkbenchOutcome.fromJson(
        await _call('/approve', {'component': component, 'platform': platform}),
      );

  @override
  Future<List<String>> unapprovePreview(
    String component,
    String platform,
  ) async =>
      ((await _call('/unapprove/preview', {
                'component': component,
                'platform': platform,
              }))['withdraws']
              as List)
          .cast<String>();

  @override
  Future<List<String>> unapprove(String component, String platform) async =>
      ((await _call('/unapprove', {
                'component': component,
                'platform': platform,
              }))['withdraws']
              as List)
          .cast<String>();

  @override
  Future<String> report({
    required String component,
    required String platform,
    required Map<String, Object?> controls,
    String? layer,
    String? variant,
    required String note,
  }) async =>
      (await _call('/report', {
            'component': component,
            'platform': platform,
            'controls': controls,
            'layer': ?layer,
            'variant': ?variant,
            'note': note,
          }))['file']
          as String;

  @override
  Future<String> send({
    required String component,
    required String platform,
    required String note,
    required List<WorkbenchFailure> failures,
  }) async =>
      (await _call('/send', {
            'component': component,
            'platform': platform,
            'note': note,
            'failures': [for (final f in failures) f.json],
          }))['file']
          as String;

  @override
  Future<({int seq, List<String> types})> events(int after) async {
    final j = await _call('/events?after=$after');
    return (
      seq: j['seq'] as int,
      types: [
        for (final e in j['events'] as List) (e as Map)['type'] as String,
      ],
    );
  }
}
