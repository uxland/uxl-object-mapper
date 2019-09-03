import * as R from 'ramda';
import { isArray, isInitial, isObject, notInitial } from '.';
import { SerializerInfo } from './model';
import { invalidPath, invalidSerializers } from './validation';

const thrower = (message: string) => {
  throw new Error(message);
};
const getFrom = R.prop('from');
const getTo = R.prop('to');
const getFn = R.prop('serializerFn');
const getSerializers = R.prop('serializers');
const hasFrom = R.pipe(
  getFrom,
  notInitial
);
const hasTo = R.pipe(
  getTo,
  notInitial
);
const hasFn = R.pipe(
  getFn,
  notInitial
);
const hasSerializers = R.pipe(getSerializers);
const hasFromTo = R.allPass([hasFrom, hasTo]);
const isPath = R.pipe(
  R.indexOf('.'),
  R.complement(R.equals(-1))
);
const isSingleObject = R.allPass([
  isArray,
  R.pipe(
    R.length,
    R.equals(1)
  )
]);
const buildFirstIndexPath = R.pipe(
  R.split('.'),
  (paths: string[]) => [paths[0], 0, ...R.remove(0, 1, paths)]
);
const getProp = (from: string | string[], data: any) =>
  R.cond([
    [isArray, () => R.reduce((collection, fromK: string) => collection.concat(data[fromK]), [], from as string[])],
    [
      isPath,
      () =>
        R.cond([
          [isObject, R.always(R.path(R.split('.', from as string), data))],
          [isSingleObject, R.always(R.path(buildFirstIndexPath(from as string), data))],
          [R.T, () => thrower(invalidPath)]
        ])(R.prop(R.split('.', from as string)[0], data))
    ],
    [R.T, R.always(R.prop(from as string, data))]
  ])(from);
const lensProp = (prop: string) => R.ifElse(isPath, () => R.lensPath(R.split('.')(prop)), () => R.lensProp(prop))(prop);
const setOutput = (from: string, to: string, value: any) => R.set(lensProp(to || from), value || undefined);
const multipleTo = (data: any, from: string | string[], to: string[]) =>
  R.cond([
    [R.equals, () => R.reduce((collection, toK: string) => inToOut(data, toK, toK)(collection), {}, to)],
    [R.T, () => R.reduce((collection, toK: string) => inToOut(data, from, toK)(collection), {}, to)]
  ])(from, to);
const executeFn = (data: any, from: string | string[], fn: Function) =>
  R.ifElse(
    isArray,
    () => fn(...data),
    () =>
      R.ifElse(isArray, () => R.reduce((collection: any[], d) => collection.concat(fn(d)), [], data), () => fn(data))(
        data
      )
  )(from);
const assignInputToOutput = (
  data: any,
  from: string | string[],
  to?: string,
  serializerFn?: Function,
  serializers?: any[]
) => (output: any) =>
  R.cond([
    [hasFn, () => setOutput(from as string, to, executeFn(data, from, serializerFn))(output)],
    [hasSerializers, () => setOutput(from as string, to, serialize(data, serializers))(output)],
    [R.T, () => setOutput(from as string, to, data)(output)]
  ])({
    serializerFn,
    serializers
  });
export const inToOut = (
  data: any,
  from: string | string[],
  to?: string | string[],
  fn?: Function,
  serializers?: any
) => (output: any) =>
  R.cond([
    [
      hasFromTo,
      () =>
        R.cond([
          [isArray, () => multipleTo(data, from, to as string[])],
          [R.T, R.always(assignInputToOutput(getProp(from, data), from, to as string, fn, serializers)(output))]
        ])(to)
    ],
    [R.T, R.always(assignInputToOutput(getProp(from, data), from, undefined, fn, serializers)(output))]
  ])({
    from,
    to
  });

const serializeArray = <I, O>(i: I[], serializers: SerializerInfo<I, O>[]): O[] =>
  R.reduce<I, O[]>((collection, d) => collection.concat(serialize(d, serializers)), [], i as I[]);
const serializeObject = <I, O>(i: I, serializers: SerializerInfo<I, O>[]): O =>
  R.reduce<SerializerInfo<I, O>, O>(
    (o, s) =>
      inToOut(i, getFrom(s) as string | string[], getTo(s as any), getFn(s as any), getSerializers(s as any))(o),
    {} as O,
    serializers
  );

export const serialize = <I, O>(i: I | I[], serializers?: SerializerInfo<I, O>[]): O =>
  R.cond([
    [isInitial, R.always(i)],
    [invalidSerializers, R.always(i)],
    [
      R.T,
      () => R.ifElse(isArray, () => serializeArray(i as I[], serializers), () => serializeObject(i, serializers))(i)
    ]
  ])(serializers);

//

// const thrower = (message: string) => {
//   throw new Error(message);
// };
// const findSerializer = <S, L>(serializers: SerializerInfo<S, L>[], property: string) =>
//   serializers.find(s => s.serializeProp == property);
// const getSerializerFn: Function = R.prop('serializerFn');
// const getDeserializeProp = <S, L>(serializer: SerializerInfo<S, L>, key: string & keyof S) =>
//   (R.prop('deserializeProp', serializer) as string & keyof S) || key;
// const recursiveSerialize = <S, L>(input: S, key: string & keyof S, serializers: SerializerInfo<S, L>) =>
//   serialize(R.prop(key, input) as any, R.prop('serializers', serializers) as SerializerInfo<S, L>[]);
// const performSerialization = <S, L>(input: S, serializers: SerializerInfo<S, L>[]) =>
//   R.reduce(
//     (output, k: string & keyof S) =>
//       R.pipe(
//         findSerializer,
//         (s: SerializerInfo<S, L>) => ({
//           s,
//           value: R.cond([
//             [isInitial, R.always(R.prop(k, input))],
//             [hasInvalidStructure, () => thrower(invalidSerializerStructure)],
//             [hasInvalidSerializerFn, () => thrower(invalidSerializerFn)],
//             [hasSerializerFn, () => getSerializerFn(s)(R.prop(k, input))],
//             [hasSerializers, () => recursiveSerialize(input, k, s)],
//             [R.T, R.always(R.prop(k, input))]
//           ])(s)
//         }),
//         (i: { s: SerializerInfo<S, L>; value: any }) => R.set(R.lensProp(getDeserializeProp(i.s, k)), i.value, output)
//       )(serializers, k),
//     {},
//     R.keys(input)
//   );

// const serializeInput = <S, L>(input: S, serializers: SerializerInfo<S, L>[]) =>
//   R.ifElse(
//     isArray,
//     () => R.reduce((acc, item) => acc.concat(performSerialization(item, serializers)), [], input as any),
//     () => performSerialization<S, L>(input, serializers)
//   )(input);
// export const serialize = <S, L>(input: S, serializers?: SerializerInfo<S, L>[]): L =>
//   R.cond([
//     [isInitial, R.always(input)],
//     [invalidSerializers, R.always(undefined)],
//     [R.T, () => serializeInput(input, serializers)]
//   ])(serializers);
