// import { ObjectMapper } from 'json-object-mapper';
import { ObjectMapper } from 'json-object-mapper';
import 'reflect-metadata';
import { SAPBooleanSerializer } from '../../src/boolean-serializer';
import { deserialize } from '../../src/deserialize';
import { serialize } from '../../src/serialize';
import { serialize as serializeSet } from '../../src/serialize-set';
import { input } from './sap/input';
import { MedicalReport } from './sap/json-object-mapper';
import { serializers } from './sap/serializers';

describe('Sandbox', () => {
  it('From plain to plain', () => {
    const input = { foo: 'bar' };
    const serializers: any = [{ from: 'foo', to: 'FOO' }];
    expect(serialize(input, serializers)).toStrictEqual({ FOO: 'bar' });
  });
  it('From nested to plain', () => {
    const input = { foo: { baz: 'bar' } };
    const serializers: any = [{ from: 'foo.baz', to: 'foo' }];
    expect(serialize(input, serializers)).toStrictEqual({ foo: 'bar' });
  });
  it('From plain to nested', () => {
    const input = { foo: 'bar' };
    const serializers: any = [{ from: 'foo', to: 'foo.baz' }];
    expect(serialize(input, serializers)).toStrictEqual({ foo: { baz: 'bar' } });
  });
  it('From nested to plain and from plain to nested using same serializer', () => {
    const input = { foo: { baz: 'bar' } };
    const serializers: any = [{ from: 'foo.baz', to: 'baz' }];
    const output = serialize(input, serializers); // {foo: 'bar'};
    expect(serialize(input, serializers)).toStrictEqual({ baz: 'bar' });
    expect(deserialize(output, serializers)).toStrictEqual(input); // {foo: {baz: 'bar'}};
  });
  it('if input[from] is empty string, when using SAPBooleanSerializer, output must be false', () => {
    const input = { foo: '' };
    const output = { FOO: false };
    const serializers: any = [{ from: 'foo', to: 'FOO', serializerFn: SAPBooleanSerializer }];
    expect(serialize(input, serializers)).toStrictEqual(output);
  });
  it('Massive object serialization: uxl-object-mapper vs json-object-mapper', () => {
    const nTests: number = 50;
    let results = {
      uxl: [],
      set: [],
      json: []
    };
    for (let i = 0; i < nTests; i++) {
      const t1 = performance.now();
      serialize(input, serializers);
      const t2 = performance.now();
      serializeSet(input, serializers);
      const t3 = performance.now();
      ObjectMapper.deserializeArray(MedicalReport, input);
      const t4 = performance.now();
      results.uxl.push(t2 - t1);
      results.set.push(t3 - t2);
      results.json.push(t4 - t3);
    }
    let means = {
      uxl: results.uxl.reduce((acc, time) => (acc += time), 0) / nTests,
      set: results.set.reduce((acc, time) => (acc += time), 0) / nTests,
      json: results.json.reduce((acc, time) => (acc += time), 0) / nTests
    };
    means = { ...means, ['uxl vs json']: means.uxl / means.json };
    console.table(means);
    expect(true).toBeTruthy();
  });
  it('Test serializer overhead', () => {
    const a = new Array(1000);
    const nIterations = 10;
    const results = [];
    for (let i = 0; i < nIterations; i++) {
      const t1 = performance.now();
      serialize(a, []);
      const t2 = performance.now();
      results.push(t2 - t1);
    }
    const overhead = results.reduce((acc, time) => (acc += time), 0) / nIterations;
    // console.log(`Serializer overhead: ${results.reduce((acc, time) => (acc += time), 0) / nIterations}`);
    expect(overhead).toBeLessThan(0.1);
  });
});
