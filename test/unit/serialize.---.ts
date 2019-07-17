import { format } from 'date-fns';
import { AbapBoolean, SAPBooleanSerializer } from '../../src/boolean-serializer';
import { AbapDateFormats, SAPDateSerializer } from '../../src/date-serializer';
import { deserialize, invalidSerializerFn, serialize, SerializerInfo } from '../../src/serialize';

describe('Perform serialization', () => {
  describe('Deserialize', () => {
    describe('If serializers are not defined', () => {
      it('output must be equal to input', () => {
        const input = { foo: 'bar' };
        const result = deserialize(input);
        expect(result).toStrictEqual(input);
      });
    });
    describe('If serializers are defined', () => {
      describe('If a serializer is not defined', () => {
        const serializers: SerializerInfo<any, any>[] = [
          { serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }
        ];
        const input = { foo: 'bar', boolean: true };
        const output = { foo: 'bar', boolean: AbapBoolean.True };
        const result = deserialize(input, serializers);
        expect(result).toStrictEqual(output);
      });
      describe('If deserializeProp is undefined', () => {
        it('if serializeFn is undefined, output must be equal to input', () => {
          const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo' }];
          const input = { foo: 'bar' };
          const result = deserialize(input, serializers);
          expect(result).toStrictEqual(input);
        });
        it('if serializeFn is defined, output[serializeProp] must be equal to deserialize(input[serializeProp])', () => {
          const serializers: SerializerInfo<any, any>[] = [
            {
              serializeProp: 'foo',
              serializerFn: { deserialize: (input: string): string => input.toUpperCase() }
            },
            { serializeProp: 'boolean', serializerFn: SAPBooleanSerializer },
            { serializeProp: 'date', serializerFn: SAPDateSerializer }
          ];
          const date = new Date();
          date.setMilliseconds(0);
          const input = { foo: 'bar', boolean: true, date };
          const output = {
            foo: 'BAR',
            boolean: AbapBoolean.True,
            date: { date: format(date, AbapDateFormats.Date), time: format(date, AbapDateFormats.Time) }
          };
          const result = deserialize(input, serializers);
          expect(result).toStrictEqual(output);
        });
      });
      describe('If deserializeProp is defined', () => {
        describe('If deserializeProp is string', () => {
          it('if serializeFn is undefined, output[deserializeProp] must be equal to input[serializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo', deserializeProp: 'FOO' }];
            const input = { foo: 'bar' };
            const output = { FOO: 'bar' };
            const result = deserialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
          it('if serializeFn is defined, output[deserializeProp] must be equal to deserialize(input[serializeProp])', () => {
            const serializers: SerializerInfo<any, any>[] = [
              {
                serializeProp: 'foo',
                deserializeProp: 'FOO',
                serializerFn: { deserialize: (input: string): string => input.toUpperCase() }
              }
            ];
            const input = { foo: 'bar' };
            const output = { FOO: 'BAR' };
            const result = deserialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
        });
        describe('If deserializeProp is multiple', () => {
          it('if serializerFn is undefined, input[serializeProp] must be replaced with as many output[deserializeProp] needed', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['date', 'time'] }
            ];
            const date = new Date();
            date.setMilliseconds(0);
            const input = { date };
            const output = { date, time: date };
            const result = deserialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
          it('if serializerFn is defined, it must return an object', () => {
            const goodSerializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['date', 'time'], serializerFn: { deserialize: () => '' } }
            ];
            const testThrowError = () => deserialize({ date: new Date() }, goodSerializers);
            expect(testThrowError).toThrow(invalidSerializerFn);
          });
          it('if serializerFn is defined, input[serializeProp] must be replace with serializerFn result in as many output[deserializeProp] needed', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['date', 'time'], serializerFn: SAPDateSerializer }
            ];
            const date = new Date();
            date.setMilliseconds(0);
            const input = { date };
            const output = { date: format(date, AbapDateFormats.Date), time: format(date, AbapDateFormats.Time) };
            const result = deserialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
        });
      });
    });
  });
  describe('Serialize', () => {
    describe('If serializers are not defined', () => {
      it('output must be equal to input', () => {
        const input = { FOO: 'bar' };
        const output = { foo: 'bar' };
        const result = serialize(input);
        expect(result).toStrictEqual(input);
      });
    });
    describe('If serializers are defined', () => {
      describe('If a serializer is not defined', () => {
        const serializers: SerializerInfo<any, any>[] = [
          { serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }
        ];
        const input = { foo: 'bar', boolean: AbapBoolean.True };
        const output = { foo: 'bar', boolean: true };
        const result = serialize(input, serializers);
        expect(result).toStrictEqual(output);
      });
      describe('If deserializeProp is undefined', () => {
        it('if serializeFn is undefined, output must be equal to input', () => {
          const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo' }];
          const input = { foo: 'bar' };
          const result = serialize(input, serializers);
          expect(result).toStrictEqual(input);
        });
        it('if serializeFn is defined, output[serializeProp] must be equal to serialize(input[serializeProp])', () => {
          const serializers: SerializerInfo<any, any>[] = [
            {
              serializeProp: 'foo',
              serializerFn: { serialize: (input: string): string => input.toLowerCase() }
            },
            { serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }
          ];
          const date = new Date();
          date.setMilliseconds(0);
          const input = { foo: 'BAR', boolean: AbapBoolean.True };
          const output = {
            foo: 'bar',
            boolean: true
          };
          const result = serialize(input, serializers);
          expect(result).toStrictEqual(output);
        });
      });
      describe('If deserializeProp is defined', () => {
        describe('If deserializeProp is string', () => {
          it('if serializeFn is undefined, output[deserializeProp] must be equal to input[serializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo', deserializeProp: 'FOO' }];
            const input = { FOO: 'bar' };
            const output = { foo: 'bar' };
            const result = serialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
          it('if serializeFn is defined, output[deserializeProp] must be equal to serialize(input[serializeProp])', () => {
            const serializers: SerializerInfo<any, any>[] = [
              {
                serializeProp: 'foo',
                deserializeProp: 'FOO',
                serializerFn: { serialize: input => input.toLowerCase() }
              }
            ];
            const input = { FOO: 'BAR' };
            const output = { foo: 'bar' };
            const result = serialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
        });
        describe('If deserializeProp is multiple', () => {
          it('if serializerFn is undefined, all output[deserializeProp] must converge to input[serializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['date', 'time'] }
            ];
            const date = new Date();
            const input = { date, time: date };
            const output = { date };
            const result = serialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
          it('if serializerFn is defined, all output[deserializeProp] must converge to serialize(input[serializeProp])', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['date', 'time'], serializerFn: SAPDateSerializer }
            ];
            const date = new Date();
            date.setMilliseconds(0);
            const input = { date: format(date, AbapDateFormats.Date), time: format(date, AbapDateFormats.Time) };
            const output = { date };
            const result = serialize(input, serializers);
            expect(result).toStrictEqual(output);
          });
        });
      });
    });
  });
});
