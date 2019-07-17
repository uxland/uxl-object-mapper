import { AbapBoolean, SAPBooleanSerializer } from '../../src/boolean-serializer';
import { SAPDateSerializer } from '../../src/date-serializer';
import {
  deserialize,
  invalidSerializeProp,
  invalidSerializerFn,
  requiredSerializeFn,
  serialize,
  SerializerInfo,
  validateSerializers
} from '../../src/serialize';

let date: Date, input: any, output: any, serializers: SerializerInfo<any, any>[];
describe('Serializer', () => {
  describe('Validate serializers', () => {
    it('all serializers must have a serializeProp', () => {
      const serializers: any = [{ serializeProp: 'foo' }, {}];
      const testSerializer = () => validateSerializers(serializers);
      expect(testSerializer).toThrow(invalidSerializeProp);
    });
  });
  describe('Deserialize', () => {
    beforeAll(() => {
      date = new Date();
      input = { foo: 'bar', boolean: true, date };
    });
    describe('If serializers are not defined', () => {
      it('output must be equal to input', () => {
        expect(deserialize(input)).toStrictEqual(input);
        expect(deserialize(input, [])).toStrictEqual(input);
      });
    });
    describe('If serializers are defined', () => {
      it('all serializers must have serializeProp', () => {
        const serializers: any = [{ serializeProp: 'foo' }, {}];
        const testValidSerializers = () => deserialize(input, serializers);
        expect(testValidSerializers).toThrow(invalidSerializeProp);
      });
      describe('If serializerFn and deserializeProp are not defined', () => {
        it('output must be equal to input', () => {
          const serializers = [{ serializeProp: 'foo' }];
          expect(deserialize(input, serializers)).toStrictEqual(input);
        });
      });
      describe('If serializerFn is defined and deserializeProp is not defined', () => {
        it('output[serializeProp] must be equal to deserialize(input[serializeProp])', () => {
          const serializers = [{ serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }];
          const output = { ...input, boolean: SAPBooleanSerializer.deserialize(input.boolean) };
          expect(deserialize(input, serializers)).toStrictEqual(output);
        });
      });
      describe('If serializerFn is not defined and deserializeProp is defined', () => {
        describe('If deserializeProp is simple', () => {
          it('output[deserializeProp] must be equal to input[serializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo', deserializeProp: 'FOO' }];
            const s = serializers[0];
            const output = {
              ...input,
              [s.deserializeProp as string]: input[s.serializeProp]
            };
            delete output[s.serializeProp];
            expect(deserialize(input, serializers)).toStrictEqual(output);
          });
        });
        describe('If deserializeProp is multiple', () => {
          it('each output[deserializeProp(n)] must be equal to input[serializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['sy-datum', 'sy-uzeit'] }
            ];
            const s = serializers[0];
            const output = {
              ...input,
              [s.deserializeProp[0] as string]: input[s.serializeProp],
              [s.deserializeProp[1] as string]: input[s.serializeProp]
            };
            delete output[s.serializeProp];
            expect(deserialize(input, serializers)).toStrictEqual(output);
          });
        });
      });
      describe('If serializerFn and deserializeProp are defined', () => {
        describe('If deserializeProp is simple', () => {
          it('output[deserializeProp] must be equal to deserialize(input[serializeProp])', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'boolean', deserializeProp: 'BOOLEAN', serializerFn: SAPBooleanSerializer }
            ];
            const s = serializers[0];
            const output = {
              ...input,
              [s.deserializeProp as string]: SAPBooleanSerializer.deserialize(input[s.serializeProp])
            };
            delete output[s.serializeProp];
            expect(deserialize(input, serializers)).toStrictEqual(output);
          });
        });
        describe('If deserializeProp is multiple', () => {
          it('serializeFn.deserialize must return an object', () => {
            const serializers: SerializerInfo<any, any>[] = [
              {
                serializeProp: 'date',
                deserializeProp: ['sy-datum', 'sy-uzeit'],
                serializerFn: { deserialize: () => true }
              }
            ];
            const testValidSerializerFn = () => deserialize(input, serializers);
            expect(testValidSerializerFn).toThrow(invalidSerializerFn);
          });
          it('output[deserializeProp(n)] must be equal to deserialize(input[serializeProp])[deserializeProp(n)]', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['sy-datum', 'sy-uzeit'], serializerFn: SAPDateSerializer }
            ];
            const s = serializers[0];
            const output = {
              ...input,
              [s.deserializeProp[0] as string]: SAPDateSerializer.deserialize(
                input[s.serializeProp],
                s.deserializeProp as string[]
              )[s.deserializeProp[0]],
              [s.deserializeProp[1] as string]: SAPDateSerializer.deserialize(
                input[s.serializeProp],
                s.deserializeProp as string[]
              )[s.deserializeProp[1]]
            };
            delete output[s.serializeProp];
            expect(deserialize(input, serializers)).toStrictEqual(output);
          });
        });
      });
    });
  });
  describe('Serialize', () => {
    beforeAll(() => {
      date = new Date();
      input = {
        FOO: 'bar',
        boolean: AbapBoolean.True,
        'sy-datum': SAPDateSerializer.deserialize(date).date,
        'sy-uzeit': SAPDateSerializer.deserialize(date).time
      };
    });
    describe('If serializers are not defined', () => {
      it('output must be equal to input', () => {
        expect(serialize(input)).toStrictEqual(input);
        expect(serialize(input, [])).toStrictEqual(input);
      });
    });
    describe('If serializers are defined', () => {
      describe('If serializerFn and deserializeProp are not defined', () => {
        it('output must be equal to input', () => {
          const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo' }];
          expect(serialize(input, serializers)).toStrictEqual(input);
        });
      });
      describe('If serializerFn is defined and deserializeProp is not defined', () => {
        it('output[deserializeProp] must be equal to serialize(input)', () => {
          const serializers: SerializerInfo<any, any>[] = [
            { serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }
          ];
          const output = { ...input, boolean: SAPBooleanSerializer.serialize(input.boolean) };
          expect(serialize(input, serializers)).toStrictEqual(output);
        });
      });
      describe('If serializerFn is not defined and deserializeProp is defined', () => {
        describe('If deserializeProp is simple', () => {
          it('output[serializeProp] must be equal to input[deserializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo', deserializeProp: 'FOO' }];
            const s = serializers[0];
            const output = { ...input, [s.serializeProp]: input[s.deserializeProp as string] };
            delete output[s.deserializeProp as string];
            expect(serialize(input, serializers)).toStrictEqual(output);
          });
        });
        describe('If deserializeProp is multiple', () => {
          it('all input[deserializeProp(n)] must be equal', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'foo', deserializeProp: ['foo1', 'foo2'] }
            ];
            const input = { foo1: 'bar', foo2: 'baz' };
            const testValidInput = () => serialize(input, serializers);
            expect(testValidInput).toThrow(requiredSerializeFn);
          });
          it('output[serializeProp] must be equal to each input[deserializeProp(n)]', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'foo', deserializeProp: ['foo1', 'foo2'] }
            ];
            const input = { foo1: 'bar', foo2: 'bar' };
            const output = { foo: 'bar' };
            expect(serialize(input, serializers)).toStrictEqual(output);
          });
        });
      });
      describe('If serializerFn and deserializeProp are defined', () => {
        describe('If deserializeProp is simple', () => {
          it('serialize(output[deserializeProp]) must be equal to input[serializeProp]', () => {
            const serializers: SerializerInfo<any, any>[] = [
              { serializeProp: 'date', deserializeProp: ['sy-datum', 'sy-uzeit'], serializerFn: SAPDateSerializer }
            ];
            const output = {
              ...input,
              date: SAPDateSerializer.serialize(input, serializers[0].deserializeProp as string[])
            };
            (serializers[0].deserializeProp as string[]).forEach(p => delete output[p]);
            expect(serialize(input, serializers)).toStrictEqual(output);
          });
        });
        describe('If deserializeProp is multiple', () => {
          it('serialize(output) must be equal to input[serializeProp]', () => {});
        });
      });
    });
  });
});
