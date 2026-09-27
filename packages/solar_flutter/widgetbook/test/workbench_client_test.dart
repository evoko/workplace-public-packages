// The workbench's HTTP client (lib/workbench/client.dart) against package:http's MockClient: what
// it asks, and how the service's answers and refusals reach the bar.

import 'dart:convert';

import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';
import 'package:solar_widgetbook/workbench/client.dart';
import 'package:solar_widgetbook/workbench/models.dart';

const _status = {'busy': null, 'pending': null, 'components': {}};

void main() {
  final asked = <String>[];

  HttpWorkbenchClient client(
    Future<http.Response> Function(http.Request) answer,
  ) => HttpWorkbenchClient(
    'http://127.0.0.1:6011',
    client: MockClient((r) {
      asked.add(
        '${r.method} ${r.url.path}${r.url.hasQuery ? '?${r.url.query}' : ''}',
      );
      return answer(r);
    }),
  );

  /// A JSON answer, as the service sends it (`application/json`, read as UTF-8).
  http.Response json(Object? body, [int status = 200]) => http.Response.bytes(
    utf8.encode(jsonEncode(body)),
    status,
    headers: {'content-type': 'application/json'},
  );

  setUp(asked.clear);

  test('health asks /health alone, and takes only the workbench', () async {
    expect(
      await client((_) async => json({'service': 'solar-workbench'})).health(),
      isTrue,
    );
    expect(asked, ['GET /health']);
    expect(
      await client((_) async => json({'service': 'something else'})).health(),
      isFalse,
    );
    expect(
      await client((_) async => http.Response('<html>', 200)).health(),
      isFalse,
    );
    expect(
      await client((_) async => throw http.ClientException('refused')).health(),
      isFalse,
    );
  });

  test('a service still starting refuses with 503, as such', () async {
    final c = client(
      (_) async => json({'error': 'the workbench is still starting'}, 503),
    );
    await expectLater(
      c.status(),
      throwsA(
        isA<WorkbenchException>()
            .having((e) => e.status, 'status', 503)
            .having(
              (e) => e.message,
              'message',
              'the workbench is still starting',
            ),
      ),
    );
  });

  test("a refusal's message is the service's error", () async {
    final c = client(
      (_) async => json({'error': 'Button has no pending edit'}, 409),
    );
    await expectLater(
      c.undo('Button'),
      throwsA(
        isA<WorkbenchException>()
            .having((e) => e.status, 'status', 409)
            .having((e) => '$e', 'text', 'Button has no pending edit'),
      ),
    );
  });

  test('an answer that is not JSON names its status', () async {
    await expectLater(
      client((_) async => http.Response('Bad gateway', 502)).status(),
      throwsA(
        isA<WorkbenchException>()
            .having((e) => e.status, 'status', 502)
            .having((e) => e.message, 'message', 'the workbench answered 502'),
      ),
    );
    await expectLater(
      client((_) async => http.Response('ok', 200)).status(),
      throwsA(isA<WorkbenchException>()),
    );
  });

  test(
    'set posts the contract body; events and inspect ask as the contract says',
    () async {
      late Map<String, dynamic> body;
      final c = client((r) async {
        if (r.url.path == '/set') {
          body = jsonDecode(r.body) as Map<String, dynamic>;
          expect(r.headers['Content-Type'], startsWith('application/json'));
          return json(_status);
        }
        if (r.url.path == '/events') {
          return json({
            'seq': 7,
            'events': [
              {'seq': 6, 'type': 'busy', 'message': 'Regenerating…'},
              {'seq': 7, 'type': 'changed'},
            ],
          });
        }
        return json({'error': 'no such route'}, 404);
      });
      final status = await c.set(
        component: 'Button',
        variant: 2,
        layer: 'root',
        cell: 'radius',
        scope: 'root.base.radius',
        value: {'token': 'radius.pill'},
        revision: 'r1',
      );
      expect(status.pending, isNull);
      expect(body, {
        'component': 'Button',
        'variant': 2,
        'layer': 'root',
        'cell': 'radius',
        'scope': 'root.base.radius',
        'value': {'token': 'radius.pill'},
        'revision': 'r1',
      });
      final events = await c.events(5);
      expect(events.seq, 7);
      expect(events.types, ['busy', 'changed']);
      await expectLater(
        c.inspect('Button Group', 1),
        throwsA(isA<WorkbenchException>()),
      );
      expect(asked, [
        'POST /set',
        'GET /events?after=5',
        'GET /component?name=Button+Group&variant=1',
      ]);
    },
  );

  test('a failure in words: its message, else only the parts it has', () {
    WorkbenchFailure f(Map<String, dynamic> j) => WorkbenchFailure.fromJson(j);
    expect(
      f({'platform': 'web', 'message': 'the check crashed'}).text,
      'the check crashed',
    );
    expect(
      f({
        'platform': 'flutter',
        'variant': 'size=md',
        'layer': 'label',
        'property': 'x',
        'figma': 12,
        'drawn': 14,
      }).text,
      'flutter: size=md label.x: Figma 12, drawn 14',
    );
    expect(
      f({'platform': 'parity', 'layer': 'root', 'property': 'width'}).text,
      'parity: root.width',
    );
    expect(
      f({'platform': 'web', 'figma': 'a', 'drawn': null}).text,
      'web: Figma "a", drawn null',
    );
    expect(
      f({'platform': 'web', 'variant': 'size=sm', 'layer': 'root'}).text,
      'web: size=sm root',
    );
    expect(f({'platform': 'web'}).text, 'web');
  });
}
