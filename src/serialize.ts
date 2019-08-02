import * as R from 'ramda';
import {
  hasInvalidSerializerFn,
  hasInvalidStructure,
  hasSerializerFn,
  hasSerializers,
  invalidSerializerFn,
  invalidSerializerStructure,
  isArray,
  isInitial,
  SerializerInfo
} from '.';
import { validateSerializers } from './validation';

const thrower = (message: string) => {
  throw new Error(message);
};

const validSerializers = <S, L>(serializers: SerializerInfo<S, L>[]): boolean => validateSerializers<S, L>(serializers);
const invalidSerializers = <S, L>(serializers: SerializerInfo<S, L>[]): boolean => !validSerializers(serializers);
const findSerializer = <S, L>(serializers: SerializerInfo<S, L>[], property: string) =>
  serializers.find(s => s.serializeProp == property);
const getSerializerFn: Function = R.path(['serializerFn', 'serialize']);
const getDeserializeProp = <S, L>(serializer: SerializerInfo<S, L>, key: string & keyof S) =>
  (R.prop('deserializeProp', serializer) as string & keyof S) || key;
const recursiveSerialize = <S, L>(input: S, key: string & keyof S, serializers: SerializerInfo<S, L>) =>
  serialize(R.prop(key, input) as any, R.prop('serializers', serializers) as SerializerInfo<S, L>[]);
const performSerialization = <S, L>(input: S, serializers: SerializerInfo<S, L>[]) =>
  R.reduce(
    (output, k: string & keyof S) =>
      R.pipe(
        findSerializer,
        (s: SerializerInfo<S, L>) => ({
          s,
          value: R.cond([
            [isInitial, R.always(R.prop(k, input))],
            [hasInvalidStructure, () => thrower(invalidSerializerStructure)],
            [hasInvalidSerializerFn, () => thrower(invalidSerializerFn)],
            [hasSerializerFn, () => getSerializerFn(s)(R.prop(k, input))],
            [hasSerializers, () => recursiveSerialize(input, k, s)],
            [R.T, R.always(R.prop(k, input))]
          ])(s)
        }),
        (i: { s: SerializerInfo<S, L>; value: any }) => R.set(R.lensProp(getDeserializeProp(i.s, k)), i.value, output)
      )(serializers, k),
    {},
    R.keys(input)
  );

const serializeInput = <S, L>(input: S, serializers: SerializerInfo<S, L>[]) =>
  R.ifElse(
    isArray,
    () => R.reduce((acc, item) => acc.concat(performSerialization(item, serializers)), [], input as any),
    () => performSerialization<S, L>(input, serializers)
  )(input);
export const serialize = <S, L>(input: S, serializers?: SerializerInfo<S, L>[]): L =>
  R.cond([
    [isInitial, R.always(input)],
    [invalidSerializers, R.always(undefined)],
    [R.T, () => serializeInput(input, serializers)]
  ])(serializers);

// import {
//   hasDeserializeProp,
//   hasDeserializePropAndSerializerFn,
//   hasSerializerFn,
//   hasSerializers,
//   isArray,
//   isFalse,
//   isInitial,
//   isTrue,
//   requiredSerializeFn,
//   SerializerInfo
// } from '.';
// import { validateSerializers } from './validation';

// const moveInputProperty = <S, D>(input: S, output: D, originKey: keyof S, destKey?: string): D =>
//   R.set(R.lensProp((destKey || originKey) as string), R.prop(originKey, input), output);
// const getSerializerFn: Function = R.path(['serializerFn', 'serialize']);
// const executeSerializerFn = <S, D>(input: D, output: S, k: string & keyof D, s: SerializerInfo<S, D>) =>
//   R.set(R.lensProp(k), getSerializerFn(s)(R.prop(k, input)), output);
// const serializeInputProperty = <S, D>(input: D, output: S, k: keyof D, serializer: SerializerInfo<S, D>): S => {
//   let deserializeProp = R.prop('deserializeProp', serializer);
//   let serializeProp = R.prop('serializeProp', serializer);
//   let serializerFn = getSerializerFn(serializer);
//   let values = R.reduce(
//     (values, key: keyof D) => values.concat(R.prop(key, input)),
//     [],
//     deserializeProp as (keyof D)[]
//   );
//   return R.cond([
//     [
//       R.allPass([isArray, () => R.isNil(serializerFn), () => R.equals(R.length(R.uniq(values)), 1)]),
//       R.always(R.set(R.lensProp(serializeProp), R.prop(k, input), output))
//     ],
//     [
//       R.allPass([isArray, () => R.isNil(serializerFn), () => R.gt(R.length(R.uniq(values)), 1)]),
//       () => {
//         throw new Error(requiredSerializeFn);
//       }
//     ],
//     [R.T, R.always(R.set(R.lensProp(serializeProp), R.prop(k, input), output))]
//   ])(deserializeProp);
// };

// const fullSerialization = <S, D>(input: D, output: S, k: string & keyof D, s: SerializerInfo<S, D>): S => {
//   let result = R.cond([
//     [
//       isArray,
//       () =>
//         getSerializerFn(s)(
//           R.reduce((data, k: string & keyof D) => R.set(R.lensProp(k), R.prop(k, input), data), {}, R.prop(
//             'deserializeProp',
//             s
//           ) as (keyof D)[]),
//           R.prop('deserializeProp', s)
//         )
//     ],
//     [R.T, () => getSerializerFn(s)(R.prop(k, input), R.prop('deserializeProp', s))]
//   ])(R.prop('deserializeProp', s));
//   return R.set(R.lensProp(R.prop('serializeProp', s)), result, output);
// };

// // TODO: refactor this
// const performSerialization = <S, D>(input: D, output: S, k: string & keyof D) => (serializer: SerializerInfo<S, D>) =>
//   R.cond([
//     [
//       hasSerializers,
//       () =>
//         R.set(
//           R.lensProp((R.prop('deserializeProp', serializer) as string) || k),
//           serialize(R.prop(k, input), R.prop('serializers', serializer) as SerializerInfo<S, any>[]),
//           output
//         )
//     ],
//     [hasDeserializePropAndSerializerFn, () => fullSerialization(input, output, k, serializer)],
//     [hasDeserializeProp, () => serializeInputProperty(input, output, k, serializer)],
//     [hasSerializerFn, () => executeSerializerFn(input, output, k, serializer)],
//     [R.T, R.always(input)]
//   ])(serializer);

// const findSerializer = <S, D>(serializers: SerializerInfo<S, D>[]) => (key: string) => {
//   const serializerDictionary: { [key: string]: SerializerInfo<S, D> } = R.reduce(
//     (collection, s) => {
//       if (!R.is(Array, s.deserializeProp)) collection[(s.deserializeProp as string) || s.serializeProp] = s;
//       else (s.deserializeProp as string[]).forEach(p => (collection[p] = s));
//       return collection;
//     },
//     {},
//     serializers
//   );
//   return R.prop(key, serializerDictionary);
// };

// const reduceInput = <S, D>(input: D, serializers: SerializerInfo<S, D>[]) =>
//   R.reduce(
//     (output: S, k: string & keyof D) =>
//       R.pipe(
//         findSerializer(serializers),
//         R.ifElse(
//           R.isNil,
//           R.always(moveInputProperty<D, S>(input, output, k)),
//           performSerialization(input, output as any, k)
//         )
//       )(k as string),
//     {} as S,
//     R.keys(input) as (keyof D)[]
//   );

// const proceedSerialization = <S, D>(input: D, serializers: SerializerInfo<S, D>[]): S =>
//   R.ifElse(
//     isArray,
//     () => R.reduce((acc, item: any) => acc.concat(reduceInput(item, serializers)), [], input as any),
//     R.always(reduceInput(input, serializers))
//   )(input);

// const serializeInput = <S, D>(input: D) => (serializers: SerializerInfo<S, D>[]): S =>
//   R.pipe(
//     validateSerializers,
//     R.cond([
//       [isTrue, () => proceedSerialization(input, serializers)],
//       [isFalse, R.always(undefined)],
//       [R.T, R.always(undefined)]
//     ])
//   )(serializers);

// export const serialize = <S, D>(input: D, serializers?: SerializerInfo<S, D>[]): S =>
//   R.cond([[isInitial, R.always(input)], [R.T, serializeInput(input)]])(serializers);
