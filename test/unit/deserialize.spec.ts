import { deserialize } from '../../src/deserialize';
import { SerializerInfo } from '../../src/model';
import { serialize } from '../../src/serialize';
import { invalidSerializerStructure, requiredFrom, requiredSerializeFn } from '../../src/validation';

interface anySerializerInfo extends Array<SerializerInfo<any, any, any, any>> {}

describe('Deserializer', () => {
  describe('When calling deserialization without serializers', () => {
    it('input must be pass through', () => {
      const input = { foo: 'bar' };
      expect(deserialize(input)).toStrictEqual(input);
    });
  });
  describe('Given a serializer without "from" property', () => {
    it('it must throw an error', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{} as any];
      const serializerError = () => deserialize(input, serializers);
      expect(serializerError).toThrow(requiredFrom);
    });
  });
  describe('Given a serializer with only "from" property', () => {
    it('if "from" property does not exists in input, initialize output[from] as undefined', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'FOO' }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual({ FOO: undefined });
    });
    it('if "from" property exists in input, output[from] must be equal to input[from]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo' }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    describe('and "from" is a path', () => {
      it('if input[path] is an object, output[path] must be equal to deserializerFn(input[path])', () => {
        const input = { foo: { bar: 'baz' } };
        const serializers: anySerializerInfo = [{ from: 'foo.bar' }];
        const output = serialize(input, serializers);
        expect(deserialize(output, serializers)).toStrictEqual(input);
      });
      it('if input[path] is a single object array, output[path] must be equal to flatten(input[path])', () => {
        const input = { foo: [{ bar: 'baz' }] };
        const serializers: anySerializerInfo = [{ from: 'foo.bar' }];
        const output = serialize(input, serializers);
        expect(deserialize(output, serializers)).toStrictEqual(output);
      });
    });
    it('if input[from] is an array, output[from] must be equal to input[from]', () => {
      const input = { foo: ['bar'] };
      const serializers: anySerializerInfo = [{ from: 'foo' }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
  });
  describe('Given a serializer with "from" and "to" properties', () => {
    it('output[to] must be equal to input[from]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', to: 'FOO' }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    it('if "to" property is an array, duplicate input[from] to N output[to[n]]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', to: ['FOO', 'BAR'] }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    it('if input[from] is an array, output[to] must be equal to input[from]', () => {
      const input = { foo: ['bar'] };
      const serializers: anySerializerInfo = [{ from: 'foo', to: ['FOO', 'BAR'] }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    describe('and "from" and/or "to" is a path', () => {
      it('if "to" is a path, output[path] must be equal to input[from]', () => {
        const input = { foo: 'baz' };
        const serializers: anySerializerInfo = [{ from: 'foo', to: 'foo.bar' }];
        const output = serialize(input, serializers);
        expect(deserialize(output, serializers)).toStrictEqual(input);
      });
      it('if "from" and "to" are paths, output[pathO] must be equal to input[pathI]', () => {
        const input = { foo: { bar: 'baz' } };
        const serializers: anySerializerInfo = [{ from: 'foo.bar', to: 'qux.quux' }];
        const output = serialize(input, serializers);
        expect(deserialize(output, serializers)).toStrictEqual(input);
      });
    });
    describe('and "from" is any properties array', () => {
      it('if "to" is an array, input must be equal to output', () => {
        const input = { date: '20190101', time: '100000' };
        const serializers: anySerializerInfo = [{ from: ['date', 'time'], to: ['date', 'time'] }];
        const output = serialize(input, serializers);
        expect(deserialize(output, serializers)).toStrictEqual(input);
      });
      it('if "to" is a path or single property, it must have a serializerFn', () => {
        const input = { date: '20190101', time: '100000' };
        const serializers: anySerializerInfo = [{ from: ['date', 'time'], to: 'date' }];
        const serializerError = () => deserialize(input, serializers);
        expect(serializerError).toThrow(requiredSerializeFn);
      });
      it('if "to" is a path or single property, must execute serializerFn using input[from]', () => {
        const input = { date: '20190101', time: '100000' };
        const serializerFn = (date: string, time: string) => `${date}T${time}`;
        const deserializerFn = (timestamp: string) => timestamp && timestamp.split('T');
        const serializers: anySerializerInfo = [
          { from: ['date', 'time'], to: 'timestamp', serializerFn, deserializerFn }
        ];
        const output = serialize(input, serializers);
        expect(deserialize(output, serializers)).toStrictEqual(input);
      });
    });
  });
  describe('Given a serializer with deserializerFn', () => {
    it('and only "from" property, output[from] must be equal to deserializerFn(input[from])', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [
        { from: 'foo', serializerFn: data => data.toUpperCase(), deserializerFn: data => data && data.toLowerCase() }
      ];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    it('and "from" and "to" properties, output[to] must be equal to deserializerFn(input[from])', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [
        {
          from: 'foo',
          to: 'FOO',
          serializerFn: data => data.toUpperCase(),
          deserializerFn: data => data && data.toLowerCase()
        }
      ];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    it('and input[from] is an array, output[to] must be equal to deserialize each input[from]', () => {
      const input = { foo: ['bar', 'baz'] };
      const serializers: anySerializerInfo = [
        {
          from: 'foo',
          to: 'FOO',
          serializerFn: data => data.toUpperCase(),
          deserializerFn: data => data && data.toLowerCase()
        }
      ];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
  });
  describe('Given a serializer with sub-serializers', () => {
    it('if input[from] is an object, serialize input[from] to output[to] using sub-serializers', () => {
      const input = { foo: { bar: 'baz' } };
      const serializers: anySerializerInfo = [{ from: 'foo', to: 'FOO', serializers: [{ from: 'bar' }] }];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
    it('and input[from] is an array, output[to]', () => {
      const input = { foo: [{ bar: 'baz', qux: 'quux' }] };
      const serializers: anySerializerInfo = [
        {
          from: 'foo',
          to: 'FOO',
          serializers: [
            {
              from: 'bar',
              to: 'BAR',
              serializerFn: value => value && value.toUpperCase(),
              deserializerFn: value => value && value.toLowerCase()
            },
            { from: 'qux', to: 'QUX' }
          ]
        }
      ];
      const output = serialize(input, serializers);
      expect(deserialize(output, serializers)).toStrictEqual(input);
    });
  });
  describe('Given a serializer with serializerFn and sub-serializers', () => {
    it('it must throw an error of invalid serializer structure', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo = [{ from: 'foo', serializerFn: () => null, serializers: [] }];
      const serializerError = () => deserialize(input, serializers);
      expect(serializerError).toThrow(invalidSerializerStructure);
    });
  });
});
