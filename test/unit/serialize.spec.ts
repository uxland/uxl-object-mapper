import * as R from 'ramda';
import { SerializerInfo } from '../../src/model';
import { serialize } from '../../src/serialize';
import { invalidPath, invalidSerializerStructure, requiredFrom, requiredSerializeFn } from '../../src/validation';

interface anySerializerInfo extends Array<SerializerInfo<any, any, any, any>> {}

describe('Serializer', () => {
  describe('When calling serialization without serializers', () => {
    it('input must be pass through', () => {
      const input = { foo: 'bar' };
      expect(serialize(input)).toStrictEqual(input);
    });
  });
  describe('Given a serializer without "from" property', () => {
    it('it must throw an error', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{} as any];
      const serializerError = () => serialize(input, serializers);
      expect(serializerError).toThrow(requiredFrom);
    });
  });
  describe('Given a serializer with only "from" property', () => {
    it('if "from" property does not exists in input, initialize output[from] as undefined', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'FOO' }];
      expect(serialize(input, serializers)).toStrictEqual({ FOO: undefined });
    });
    it('if "from" property exists in input, output[from] must be equal to input[from]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo' }];
      expect(serialize(input, serializers)).toStrictEqual(input);
    });
    describe('and "from" is a path', () => {
      it('if input[path] is an object, output[path] must be equal to input[path]', () => {
        const input = { foo: { bar: 'baz' } };
        const serializers: anySerializerInfo = [{ from: 'foo.bar', deserializerFn: () => null }];
        expect(serialize(input, serializers)).toStrictEqual(input);
      });
      it('if input[path] is a single object array, output[path] must be equal to flatten(input[path])', () => {
        const input = { foo: [{ bar: 'baz' }] };
        const serializers: anySerializerInfo = [{ from: 'foo.bar', deserializerFn: () => null }];
        const output = { foo: { bar: 'baz' } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
      it('if input[path] is an array, it must throw an error', () => {
        const input = { foo: [{ bar: 'baz' }, { qux: 'quux' }] };
        const serializers: anySerializerInfo = [{ from: 'foo.bar', deserializerFn: () => null }];
        const serializerError = () => serialize(input, serializers);
        expect(serializerError).toThrow(invalidPath);
      });
    });
    it('if input[from] is an array, output[from] must be equal to input[from]', () => {
      const input = { foo: ['bar'] };
      const serializers: anySerializerInfo = [{ from: 'foo' }];
      expect(serialize(input, serializers)).toStrictEqual(input);
    });
  });
  describe('Given a serializer with "from" and "to" properties', () => {
    it('output[to] must be equal to input[from]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', to: 'FOO' }];
      const output = { FOO: 'bar' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('if "to" property is an array, duplicate input[from] to N output[to[n]]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', to: ['FOO', 'BAR'] }];
      const output = { FOO: 'bar', BAR: 'bar' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('if input[from] is an array, output[to] must be equal to input[from]', () => {
      const input = { foo: ['bar'] };
      const serializers: anySerializerInfo = [{ from: 'foo', to: ['FOO', 'BAR'] }];
      const output = { FOO: ['bar'], BAR: ['bar'] };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    describe('and "from" and/or "to" is a path', () => {
      it('if "to" is a path, output[path] must be equal to input[from]', () => {
        const input = { foo: 'baz' };
        const serializers: anySerializerInfo = [{ from: 'foo', to: 'foo.bar' }];
        const output = { foo: { bar: 'baz' } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
      it('if "from" and "to" are paths, output[pathO] must be equal to input[pathI]', () => {
        const input = { foo: { bar: 'baz' } };
        const serializers: anySerializerInfo = [{ from: 'foo.bar', to: 'qux.quux', deserializerFn: () => null }];
        const output = { qux: { quux: 'baz' } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
    });
    describe('and "from" is any properties array', () => {
      it('if "to" is an array, input must be equal to output', () => {
        const input = { date: '20190101', time: '100000' };
        const serializers: anySerializerInfo = [{ from: ['date', 'time'], to: ['date', 'time'] }];
        const output = { date: '20190101', time: '100000' };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
      it('if "to" is a path or single property, it must have a serializerFn', () => {
        const input = { date: '20190101', time: '100000' };
        const serializers: anySerializerInfo = [{ from: ['date', 'time'], to: 'date' }];
        const serializerError = () => serialize(input, serializers);
        expect(serializerError).toThrow(requiredSerializeFn);
      });
      it('if "to" is a path or single property, must execute serializerFn using input[from]', () => {
        const input = { date: '20190101', time: '100000' };
        const serializerFn = (date: string, time: string) => `${date}T${time}`;
        const serializers: anySerializerInfo = [{ from: ['date', 'time'], to: 'timestamp', serializerFn }];
        const output = { timestamp: serializerFn(input.date, input.time) };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
      it('if "from" has a property that does not exists, it must not dump', () => {
        const input: any = {};
        const serializerFn = (date, time) => `${date}T${time}`;
        const serializers: anySerializerInfo = [
          { from: 'data', serializers: [{ from: ['date', 'time'], to: 'timestamp', serializerFn }] }
        ];
        const output = { data: { timestamp: serializerFn(R.prop('data.date')(input), R.prop('data.time')(input)) } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
    });
  });
  describe('Given a serializer with serializerFn', () => {
    it('and only "from" property, output[from] must be equal to serializerFn(input[from])', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', serializerFn: data => data.toUpperCase() }];
      const output = { foo: 'BAR' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('and "from" and "to" properties, output[to] must be equal to serializerFn(input[from])', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', to: 'FOO', serializerFn: data => data.toUpperCase() }];
      const output = { FOO: 'BAR' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('and input[from] is an array, output[to] must be equal to serialize each input[from]', () => {
      const input = { foo: ['bar', 'baz'] };
      const serializers: anySerializerInfo = [{ from: 'foo', to: 'FOO', serializerFn: data => data.toUpperCase() }];
      const output = { FOO: ['BAR', 'BAZ'] };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
  });
  describe('Given a serializer with sub-serializers', () => {
    it('if input[from] is not an object, input[from] must be an initial object using sub-serializers', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', serializers: [{ from: 'bar' }] }];
      const output = { foo: { bar: undefined } };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('if input[from] is an object, serialize input[from] to output[to] using sub-serializers', () => {
      const input = { foo: { bar: 'baz' } };
      const serializers: anySerializerInfo = [{ from: 'foo', to: 'FOO', serializers: [{ from: 'bar' }] }];
      const output = { FOO: { bar: 'baz' } };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('and input[from] is an array, output[to]', () => {
      const input = { foo: [{ bar: 'baz', qux: 'quux' }] };
      const serializers: anySerializerInfo = [
        {
          from: 'foo',
          to: 'FOO',
          serializers: [
            { from: 'bar', to: 'BAR', serializerFn: value => value.toUpperCase() },
            { from: 'qux', to: 'QUX' }
          ]
        }
      ];
      const output = { FOO: [{ BAR: 'BAZ', QUX: 'quux' }] };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
  });
  describe('Given a serializer with serializerFn and sub-serializers', () => {
    it('it must throw an error of invalid serializer structure', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', serializerFn: () => null, serializers: [] }];
      const serializerError = () => serialize(input, serializers);
      expect(serializerError).toThrow(invalidSerializerStructure);
    });
  });
});
