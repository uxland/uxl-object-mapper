import { ObjectMapper } from 'json-object-mapper';
import 'reflect-metadata';
import { SAPBooleanSerializer } from '../../src/boolean-serializer';
import { deserialize } from '../../src/deserialize';
import { serialize } from '../../src/serialize';
import { serialize as serializeSet } from '../../src/serialize-set';
import { input } from './data/input';
import { MedicalReport } from './data/json-object-mapper';
import { serializers } from './data/serializers';

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
    const nTests: number = 5000;
    let resultsUXL: number[] = [];
    let resultsUXLSet: number[] = [];
    let resultsJSON: number[] = [];
    for (let i = 0; i < nTests; i++) {
      const t1 = performance.now();
      serialize(input, serializers);
      const t2 = performance.now();
      serializeSet(input, serializers);
      const t3 = performance.now();
      ObjectMapper.deserializeArray(MedicalReport, input);
      const t4 = performance.now();
      resultsUXL.push(t2 - t1);
      resultsUXLSet.push(t3 - t2);
      resultsJSON.push(t4 - t3);
    }
    const uxlMeanTime = resultsUXL.reduce((acc, time) => (acc += time), 0) / nTests;
    const uxlSetMeanTime = resultsUXLSet.reduce((acc, time) => (acc += time), 0) / nTests;
    const jsonMeanTime = resultsJSON.reduce((acc, time) => (acc += time), 0) / nTests;
    console.log(
      `[json-object-mapper] Mean Time: ${jsonMeanTime} ms
      \n[uxl-object-mapper] Mean Time: ${uxlMeanTime} ms
      \n[uxl-object-mapper - SET] Mean Time: ${uxlSetMeanTime} ms`
    );
    expect(uxlMeanTime).toBeLessThanOrEqual(20);
    expect(jsonMeanTime).toBeLessThanOrEqual(20);

    // expect(serialize(input, serializers)).toStrictEqual(output);
    // expect(ObjectMapper.deserializeArray(MedicalReport, input)).toStrictEqual(output);

    // const serialization = serialize(input, serializers);
    // expect(serialization).toStrictEqual(output);
  });
});
