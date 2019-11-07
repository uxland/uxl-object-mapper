import { SAPBooleanSerializer } from '../../src/boolean-serializer';
import { deserialize } from '../../src/deserialize';
import { serialize } from '../../src/serialize';

describe('Sandbox', () => {
  it('Plain to Plain', () => {
    const input = { foo: 'bar' };
    const serializers: any = [{ from: 'foo', to: 'FOO' }];
    expect(serialize(input, serializers)).toStrictEqual({ FOO: 'bar' });
  });
  it('Object to Plain', () => {
    const input = { foo: { baz: 'bar' } };
    const serializers: any = [{ from: 'foo.baz', to: 'foo' }];
    expect(serialize(input, serializers)).toStrictEqual({ foo: 'bar' });
  });
  it('Plain to Object', () => {
    const input = { foo: 'bar' };
    const serializers: any = [{ from: 'foo', to: 'foo.baz' }];
    expect(serialize(input, serializers)).toStrictEqual({ foo: { baz: 'bar' } });
  });
  it('test', () => {
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
});
