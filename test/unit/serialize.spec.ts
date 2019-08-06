import { SerializerInfo } from '../../src/model';
import { serialize } from '../../src/serialize';
import { invalidPath, invalidSerializerStructure, requiredFrom } from '../../src/validation';

interface anySerializerInfo extends SerializerInfo<any, any> {}

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
      const serializers: anySerializerInfo[] = [{} as any];
      const serializerError = () => serialize(input, serializers);
      expect(serializerError).toThrow(requiredFrom);
    });
    it('input must be pass through', () => {
      const input = { foo: 'bar' };
      expect(serialize(input)).toStrictEqual(input);
    });
  });
  describe('Given a serializer with only "from" property', () => {
    it('if "from" property does not exists in input, initialize output[from] as undefined', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'FOO' }];
      expect(serialize(input, serializers)).toStrictEqual({ FOO: undefined });
    });
    it('if "from" property exists in input, output[from] must be equal to input[from]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'foo' }];
      expect(serialize(input, serializers)).toStrictEqual(input);
    });
    describe('and "from" is a path', () => {
      it('if input[path] is an object, output[path] must be equal to input[path]', () => {
        const input = { foo: { bar: 'baz' } };
        const serializers: anySerializerInfo[] = [{ from: 'foo.bar' }];
        expect(serialize(input, serializers)).toStrictEqual(input);
      });
      it('if input[path] is a single object array, output[path] must be equal to flatten(input[path])', () => {
        const input = { foo: [{ bar: 'baz' }] };
        const serializers: anySerializerInfo[] = [{ from: 'foo.bar' }];
        const output = { foo: { bar: 'baz' } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
      it('if input[path] is an array, it must throw an error', () => {
        const input = { foo: [{ bar: 'baz' }, { qux: 'quux' }] };
        const serializers: anySerializerInfo[] = [{ from: 'foo.bar' }];
        const serializerError = () => serialize(input, serializers);
        expect(serializerError).toThrow(invalidPath);
      });
    });

    it('if input[from] is an array, output[from] must be equal to input[from]', () => {
      const input = { foo: ['bar'] };
      const serializers: anySerializerInfo[] = [{ from: 'foo' }];
      expect(serialize(input, serializers)).toStrictEqual(input);
    });
  });
  describe('Given a serializer with "from" and "to" properties', () => {
    it('output[to] must be equal to input[from]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'foo', to: 'FOO' }];
      const output = { FOO: 'bar' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('if "to" property is an array, duplicate input[from] to N output[to[n]]', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'foo', to: ['FOO', 'BAR'] }];
      const output = { FOO: 'bar', BAR: 'bar' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('if input[from] is an array, output[to] must be equal to input[from]', () => {
      const input = { foo: ['bar'] };
      const serializers: anySerializerInfo[] = [{ from: 'foo', to: ['FOO', 'BAR'] }];
      const output = { FOO: ['bar'], BAR: ['bar'] };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    describe('and "from" and/or "to" is a path', () => {
      it('if "to" is a path, output[path] must be equal to input[from]', () => {
        const input = { foo: 'baz' };
        const serializers: anySerializerInfo[] = [{ from: 'foo', to: 'foo.bar' }];
        const output = { foo: { bar: 'baz' } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
      it('if "from" and "to" are paths, output[pathO] must be equal to input[pathI]', () => {
        const input = { foo: { bar: 'baz' } };
        const serializers: anySerializerInfo[] = [{ from: 'foo.bar', to: 'qux.quux' }];
        const output = { qux: { quux: 'baz' } };
        expect(serialize(input, serializers)).toStrictEqual(output);
      });
    });
  });
  describe('Given a serializer with serializerFn', () => {
    it('and only "from" property, output[from] must be equal to serializerFn(input[from])', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'foo', serializerFn: data => data.toUpperCase() }];
      const output = { foo: 'BAR' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('and "from" and "to" properties, output[to] must be equal to serializerFn(input[from])', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'foo', to: 'FOO', serializerFn: data => data.toUpperCase() }];
      const output = { FOO: 'BAR' };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('and input[from] is an array, output[to] must be equal to serialize each input[from]', () => {
      const input = { foo: ['bar', 'baz'] };
      const serializers: anySerializerInfo[] = [{ from: 'foo', to: 'FOO', serializerFn: data => data.toUpperCase() }];
      const output = { FOO: ['BAR', 'BAZ'] };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
  });
  describe('Given a serializer with sub-serializers', () => {
    it('if input[from] is not an object, input[from] must be an initial object using sub-serializers', () => {
      const input = { foo: 'bar' };
      const serializers: anySerializerInfo[] = [{ from: 'foo', serializers: [{ from: 'bar' }] }];
      const output = { foo: { bar: undefined } };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('if input[from] is an object, serialize input[from] to output[to] using sub-serializers', () => {
      const input = { foo: { bar: 'baz' } };
      const serializers: anySerializerInfo[] = [{ from: 'foo', to: 'FOO', serializers: [{ from: 'bar' }] }];
      const output = { FOO: { bar: 'baz' } };
      expect(serialize(input, serializers)).toStrictEqual(output);
    });
    it('and input[from] is an array, output[to]', () => {
      const input = { foo: [{ bar: 'baz', qux: 'quux' }] };
      const serializers: anySerializerInfo[] = [
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
      const serializers: anySerializerInfo[] = [{ from: 'foo', serializerFn: () => null, serializers: [] }];
      const serializerError = () => serialize(input, serializers);
      expect(serializerError).toThrow(invalidSerializerStructure);
    });
  });
});

// import { invalidSerializeProp, invalidSerializerStructure, serialize, SerializerInfo } from '../../src';
// import { AbapBoolean, SAPBooleanSerializer } from '../../src/boolean-serializer';
// import { SAPDateSerializer } from '../../src/date-serializer';
// import { validateSerializers } from '../../src/validation';

// let date: Date, input: any, output: any, serializers: SerializerInfo<any, any>[];
// describe('Serializer', () => {
//   describe('Validate serializers', () => {
//     it('all serializers must have a serializeProp', () => {
//       const serializers: any = [{ serializeProp: 'foo' }, {}];
//       const testSerializer = () => validateSerializers(serializers);
//       expect(testSerializer).toThrow(invalidSerializeProp);
//     });
//   });
//   // describe('Deserialize', () => {
//   //   beforeAll(() => {
//   //     date = new Date();
//   //     input = { foo: 'bar', boolean: true, date };
//   //   });
//   //   describe('If serializers are not defined', () => {
//   //     it('output must be equal to input', () => {
//   //       expect(deserialize(input)).toStrictEqual(input);
//   //       expect(deserialize(input, [])).toStrictEqual(input);
//   //     });
//   //   });
//   //   describe('If serializers are defined', () => {
//   //     it('all serializers must have serializeProp', () => {
//   //       const serializers: any = [{ serializeProp: 'foo' }, {}];
//   //       const testValidSerializers = () => deserialize(input, serializers);
//   //       expect(testValidSerializers).toThrow(invalidSerializeProp);
//   //     });
//   //     describe('If serializerFn and deserializeProp are not defined', () => {
//   //       it('output must be equal to input', () => {
//   //         const serializers = [{ serializeProp: 'foo' }];
//   //         expect(deserialize(input, serializers)).toStrictEqual(input);
//   //       });
//   //     });
//   //     describe('If serializerFn is defined and deserializeProp is not defined', () => {
//   //       it('output[serializeProp] must be equal to deserialize(input[serializeProp])', () => {
//   //         const serializers = [{ serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }];
//   //         const output = { ...input, boolean: SAPBooleanSerializer.deserialize(input.boolean) };
//   //         expect(deserialize(input, serializers)).toStrictEqual(output);
//   //       });
//   //     });
//   //     describe('If serializerFn is not defined and deserializeProp is defined', () => {
//   //       describe('If deserializeProp is simple', () => {
//   //         it('output[deserializeProp] must be equal to input[serializeProp]', () => {
//   //           const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'foo', deserializeProp: 'FOO' }];
//   //           const s = serializers[0];
//   //           const output = {
//   //             ...input,
//   //             [s.deserializeProp as string]: input[s.serializeProp]
//   //           };
//   //           delete output[s.serializeProp];
//   //           expect(deserialize(input, serializers)).toStrictEqual(output);
//   //         });
//   //       });
//   //       describe('If deserializeProp is multiple', () => {
//   //         it('each output[deserializeProp(n)] must be equal to input[serializeProp]', () => {
//   //           const serializers: SerializerInfo<any, any>[] = [
//   //             { serializeProp: 'date', deserializeProp: ['sy-datum', 'sy-uzeit'] }
//   //           ];
//   //           const s = serializers[0];
//   //           const output = {
//   //             ...input,
//   //             [s.deserializeProp[0] as string]: input[s.serializeProp],
//   //             [s.deserializeProp[1] as string]: input[s.serializeProp]
//   //           };
//   //           delete output[s.serializeProp];
//   //           expect(deserialize(input, serializers)).toStrictEqual(output);
//   //         });
//   //       });
//   //     });
//   //     describe('If serializerFn and deserializeProp are defined', () => {
//   //       describe('If deserializeProp is simple', () => {
//   //         it('output[deserializeProp] must be equal to deserialize(input[serializeProp])', () => {
//   //           const serializers: SerializerInfo<any, any>[] = [
//   //             { serializeProp: 'boolean', deserializeProp: 'BOOLEAN', serializerFn: SAPBooleanSerializer }
//   //           ];
//   //           const s = serializers[0];
//   //           const output = {
//   //             ...input,
//   //             [s.deserializeProp as string]: SAPBooleanSerializer.deserialize(input[s.serializeProp])
//   //           };
//   //           delete output[s.serializeProp];
//   //           expect(deserialize(input, serializers)).toStrictEqual(output);
//   //         });
//   //       });
//   //       describe('If deserializeProp is multiple', () => {
//   //         it('serializeFn.deserialize must return an object', () => {
//   //           const serializers: SerializerInfo<any, any>[] = [
//   //             {
//   //               serializeProp: 'date',
//   //               deserializeProp: ['sy-datum', 'sy-uzeit'],
//   //               serializerFn: { deserialize: () => true }
//   //             }
//   //           ];
//   //           const testValidSerializerFn = () => deserialize(input, serializers);
//   //           expect(testValidSerializerFn).toThrow(invalidSerializerFn);
//   //         });
//   //         it('output[deserializeProp(n)] must be equal to deserialize(input[serializeProp])[deserializeProp(n)]', () => {
//   //           const serializers: SerializerInfo<any, any>[] = [
//   //             { serializeProp: 'date', deserializeProp: ['sy-datum', 'sy-uzeit'], serializerFn: SAPDateSerializer }
//   //           ];
//   //           const s = serializers[0];
//   //           const output = {
//   //             ...input,
//   //             [s.deserializeProp[0] as string]: SAPDateSerializer.deserialize(
//   //               input[s.serializeProp],
//   //               s.deserializeProp as string[]
//   //             )[s.deserializeProp[0]],
//   //             [s.deserializeProp[1] as string]: SAPDateSerializer.deserialize(
//   //               input[s.serializeProp],
//   //               s.deserializeProp as string[]
//   //             )[s.deserializeProp[1]]
//   //           };
//   //           delete output[s.serializeProp];
//   //           expect(deserialize(input, serializers)).toStrictEqual(output);
//   //         });
//   //       });
//   //     });
//   //   });
//   // });
//   describe('Serialize', () => {
//     beforeAll(() => {
//       date = new Date();
//       input = {
//         FOO: 'bar',
//         boolean: AbapBoolean.True,
//         'sy-datum': SAPDateSerializer.deserialize(date).date,
//         'sy-uzeit': SAPDateSerializer.deserialize(date).time
//       };
//     });
//     describe('If serializers are not defined', () => {
//       it('output must be equal to input', () => {
//         expect(serialize(input)).toStrictEqual(input);
//         expect(serialize(input, [])).toStrictEqual(input);
//       });
//     });
//     describe('If serializers are defined', () => {
//       describe('If only serializeProp is defined', () => {
//         it('output must be equal to input', () => {
//           const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'FOO' }];
//           expect(serialize(input, serializers)).toStrictEqual(input);
//         });
//       });
//       describe('If serializerFn is defined and deserializeProp is not defined', () => {
//         it('if sub-serializers are defined, it must throw an error', () => {
//           const serializers: SerializerInfo<any, any>[] = [
//             {
//               serializeProp: 'foo',
//               serializerFn: { serialize: input => input.toUpperCase() },
//               serializers: [{ serializeProp: 'bar' }]
//             }
//           ];
//           expect(() => serialize(input, serializers)).toThrow(invalidSerializerStructure);
//         });
//         it('output[deserializeProp] must be equal to serialize(input)', () => {
//           const serializers: SerializerInfo<any, any>[] = [
//             { serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }
//           ];
//           const output = { ...input, boolean: SAPBooleanSerializer.serialize(input.boolean) };
//           expect(serialize(input, serializers)).toStrictEqual(output);
//         });
//       });
//       describe('If serializerFn is not defined', () => {
//         describe('If serializeProp is simple', () => {
//           it('output[serializeProp] must be equal to input[deserializeProp]', () => {
//             const input = { FOO: 'bar', bar: 'foo' };
//             const output = { foo: 'bar', bar: 'foo' };
//             const serializers: SerializerInfo<any, any>[] = [{ serializeProp: 'FOO', deserializeProp: 'foo' }];
//             expect(serialize(input, serializers)).toStrictEqual(output);
//           });
//         });
//         describe('If serializeProp is multiple', () => {
//           // it('a serializerFn must be defined', () => {
//           //   const serializers: SerializerInfo<any, any>[] = [
//           //     { deserializeProp: 'foo', serializeProp: ['foo1', 'foo2'] }
//           //   ];
//           //   const input = { foo1: 'bar', foo2: 'baz' };
//           //   const testValidInput = () => serialize(input, serializers);
//           //   expect(testValidInput).toThrow(requiredSerializeFn);
//           // });
//           // it('if all input[deserializeProp(n)] are the same, output[serializeProp] must be equal to each input[deserializeProp(n)]', () => {
//           //   const serializers: SerializerInfo<any, any>[] = [
//           //     { deserializeProp: 'foo', serializeProp: ['foo1', 'foo2'] }
//           //   ];
//           //   const input = { foo1: 'bar', foo2: 'bar' };
//           //   const output = { foo: 'bar' };
//           //   expect(serialize(input, serializers)).toStrictEqual(output);
//           // });
//         });
//       });
//       describe('If serializerFn and deserializeProp are defined', () => {
//         describe('If deserializeProp is simple', () => {
//           // it('serialize(output[deserializeProp]) must be equal to input[serializeProp]', () => {
//           //   const serializers: SerializerInfo<any, any>[] = [
//           //     { serializeProp: 'boolean', deserializeProp: 'BOOLEAN', serializerFn: SAPBooleanSerializer }
//           //   ];
//           //   const input = { BOOLEAN: 'X' };
//           //   const s = serializers[0];
//           //   const output = {
//           //     [s.serializeProp as string]: SAPBooleanSerializer.serialize(input[s.deserializeProp as string])
//           //   };
//           //   expect(serialize(input, serializers)).toStrictEqual(output);
//           // });
//         });
//         describe('If deserializeProp is multiple', () => {
//           // it('test', () => {
//           //   const serializers: SerializerInfo<any, any>[] = [
//           //     {
//           //       deserializeProp: 'date',
//           //       serializeProp: ['sy-datum', 'sy-uzeit'],
//           //       serializerFn: SAPDateSerializer
//           //     }
//           //   ];
//           //   const output = {
//           //     ...input,
//           //     date: SAPDateSerializer.serialize(input, serializers[0].serializeProp as string[])
//           //   };
//           //   (serializers[0].serializeProp as string[]).forEach(p => delete output[p]);
//           //   expect(serialize(input, serializers)).toStrictEqual(output);
//           // });
//         });
//       });
//       describe('If serializer has sub-serializers', () => {
//         it('if has sub-serializers and serializerFn, must throw an error', () => {
//           const serializers: SerializerInfo<any, any>[] = [
//             {
//               serializeProp: 'foo',
//               serializerFn: { serialize: () => null },
//               serializers: [{ serializeProp: 'bar' }]
//             }
//           ];
//           const testSerializer = () => serialize({ foo: 'bar' }, serializers);
//           expect(testSerializer).toThrow(invalidSerializerStructure);
//         });
//         it('nested input object must be serialized with sub-serializers', () => {
//           const serializers: SerializerInfo<any, any>[] = [
//             {
//               serializeProp: 'foo',
//               serializers: [{ serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }]
//             }
//           ];
//           const input = { foo: { boolean: AbapBoolean.True } };
//           const output = { foo: { boolean: SAPBooleanSerializer.serialize(input.foo.boolean) } };
//           expect(serialize(input, serializers)).toStrictEqual(output);
//         });
//         it('nested input object with arrays must be serialized with sub-serializers', () => {
//           const serializers: SerializerInfo<any, any>[] = [
//             {
//               serializeProp: 'foo',
//               serializers: [{ serializeProp: 'boolean', serializerFn: SAPBooleanSerializer }]
//             }
//           ];
//           const input = { foo: [{ boolean: AbapBoolean.True }, { boolean: AbapBoolean.False }] };
//           const output = {
//             foo: [
//               { boolean: SAPBooleanSerializer.serialize(input.foo[0].boolean) },
//               { boolean: SAPBooleanSerializer.serialize(input.foo[1].boolean) }
//             ]
//           };
//           expect(serialize(input, serializers)).toStrictEqual(output);
//         });
//       });
//     });
//   });
// });
