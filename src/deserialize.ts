import * as R from 'ramda';
import { invalidPath, invalidSerializers, isArray, isInitial, isObject } from '.';
import { SerializerInfo } from './model';
import {
  getDeserializerFn,
  getFrom,
  getSerializers,
  getTo,
  hasDeserializerFn,
  hasFromTo,
  hasSerializers,
  isPath,
  isSingleObject,
  lensProp,
  setProperty,
  thrower
} from './utilities';

const buildFirstIndexPath = R.pipe(
  R.split('.'),
  (paths: string[]) => [paths[0], 0, ...R.remove(0, 1, paths)]
);
const getProp = (from: string | string[], data: any) =>
  R.cond([
    [
      isArray,
      () =>
        R.reduce((collection, fromK: string) => collection.concat(data ? data[fromK] : undefined), [], from as string[])
    ],
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
const setOutputMultipleTo = (to: string[], values: any[], output) => {
  R.forEachObjIndexed(
    (toK: string, i) => {
      output = R.set(lensProp(toK), values[i])(output);
      return output;
    },
    to as string[]
  );
  return output;
};
const setOutput = (from: string, to: string | string[], value: any) => output =>
  R.ifElse(
    isArray,
    () =>
      R.ifElse(
        isArray,
        () => setOutputMultipleTo(to as string[], value, output),
        () => setProperty(output, (to as string) || from, value)
      )(value),
    () => setProperty(output, (to as string) || from, value)
  )(to);
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
  deserializerFn?: Function,
  serializers?: any[]
) => (output: any) =>
  R.cond([
    [hasDeserializerFn, () => setOutput(from as string, to, executeFn(data, from, deserializerFn))(output)],
    [hasSerializers, () => setOutput(from as string, to, deserialize(data, serializers))(output)],
    [R.T, () => setOutput(from as string, to, data)(output)]
  ])({
    deserializerFn,
    serializers
  });
const bothArray = (s: { from: string | string[]; to: string | string[] }) => isArray(s.from) && isArray(s.to);
const fromIsArray = (s: { from: string | string[]; to: string | string[] }) => isArray(s.from);
const inToOut = (data: any, from: string | string[], to?: string | string[], fn?: Function, serializers?: any) => (
  output: any
) =>
  R.cond([
    [
      hasFromTo,
      R.cond([
        [
          bothArray,
          () =>
            R.reduce(
              (collection, fromK) =>
                assignInputToOutput(
                  getProp(fromK, data),
                  fromK,
                  (to as string[]).find(toK => toK == fromK),
                  fn,
                  serializers
                )(collection),
              {},
              from as string[]
            )
        ],
        [
          fromIsArray,
          R.always(assignInputToOutput(getProp(from[0], data), from[0], to as string, fn, serializers)(output))
        ],
        [R.T, R.always(assignInputToOutput(getProp(from, data), from, to as string, fn, serializers)(output))]
      ])
    ],
    [R.T, R.always(assignInputToOutput(getProp(from, data), from, undefined, fn, serializers)(output))]
  ])({
    from,
    to
  });

const serializeArray = <I, O>(i: I[], serializers: SerializerInfo<I, O>[]): O[] =>
  R.reduce<I, O[]>((collection, d) => collection.concat(deserialize(d, serializers)), [], i);
const serializeObject = <I, O>(i: I, serializers: SerializerInfo<I, O>[]): O =>
  R.reduce<SerializerInfo<I, O>, O>(
    (o, s) => inToOut(i, getTo(s) || getFrom(s), getFrom(s), getDeserializerFn(s), getSerializers(s as any))(o),
    {} as O,
    serializers
  );

/**
 * Deserialize data using serializers. This should be used only on objects serialized with the same serializers array,
 * and the object should not have change its structure.
 * @param i Input data. Can be an object or an array
 * @param serializers Serializers array. Must contain at least a "from" property.
 */
export function deserialize<I, O>(i: I[], serializers?: SerializerInfo<I, O>[]): O[];
export function deserialize<I, O>(i: I, serializers?: SerializerInfo<I, O>[]): O;
export function deserialize<I, O>(i: I | I[], serializers?: SerializerInfo<I, O>[]): O | O[] {
  return R.cond([
    [isInitial, R.always(i)],
    [invalidSerializers, R.always(i)],
    [
      R.T,
      () =>
        R.ifElse(isArray, () => serializeArray(i as I[], serializers), () => serializeObject(i as I, serializers))(i)
    ]
  ])(serializers);
}
