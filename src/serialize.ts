import * as R from 'ramda';
import { isArray, isInitial, isObject } from '.';
import { SerializerInfo } from './model';
import {
  getFrom,
  getSerializerFn,
  getSerializers,
  getTo,
  hasSerializerFn,
  hasSerializers,
  isPath,
  isSingleObject,
  setProperty,
  thrower
} from './utilities';
import { invalidPath, validSerializers } from './validation';

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
          [isObject, () => R.path(R.split('.', from as string), data)],
          [isSingleObject, () => R.path(buildFirstIndexPath(from as string), data)],
          [R.T, () => thrower(invalidPath)]
        ])(data[R.split('.', from as string)[0]])
    ],
    [R.T, () => data[from as string]]
  ])(from);
// const setOutput = (from: string, to: string, value: any) => setProperty(from, to, value);
const multipleTo = (data: any, from: string | string[], to: string[], fn: Function) =>
  R.reduce((collection, toK: string) => inToOut(data, R.equals(from, to) ? toK : from, toK, fn)(collection), {}, to);
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
    [hasSerializerFn, () => setProperty(from as string, to, executeFn(data, from, serializerFn))(output)],
    [hasSerializers, () => setProperty(from as string, to, serialize(data, serializers))(output)],
    [R.T, () => setProperty(from as string, to, data)(output)]
  ])({
    serializerFn,
    serializers
  });
const inToOut = (data: any, from: string | string[], to?: string | string[], fn?: Function, serializers?: any) => (
  output: any
) =>
  R.cond([
    [isArray, () => multipleTo(data, from, to as string[], fn)],
    [R.T, () => assignInputToOutput(getProp(from, data), from, to as string, fn, serializers)(output)]
  ])(to);

const serializeArray = <I, O>(i: I[], serializers: SerializerInfo<I, O>[]): O[] =>
  R.reduce<I, O[]>((collection, d) => collection.concat(serialize(d, serializers)), [], i);
const serializeObject = <I, O>(i: I, serializers: SerializerInfo<I, O>[]): O =>
  R.reduce<SerializerInfo<I, O>, O>(
    (o, s) =>
      inToOut(i, getFrom(s) as string | string[], getTo(s), getSerializerFn(s as any), getSerializers(s as any))(o),
    {} as O,
    serializers
  );

/**
 * Serialize data using serializers
 * @param i Input data. Can be an object or an array
 * @param serializers Serializers array. Must contain at least a "from" property.
 */
export function serialize<I, O>(i: I[], serializers?: SerializerInfo<I, O>[]): O[];
export function serialize<I, O>(i: I, serializers?: SerializerInfo<I, O>[]): O;
export function serialize<I, O>(i: I | I[], serializers?: SerializerInfo<I, O>[]): O | O[] {
  return (
    validSerializers(serializers) &&
    R.cond([
      [isInitial, R.always(i)],
      [
        R.T,
        () =>
          R.ifElse(isArray, () => serializeArray(i as I[], serializers), () => serializeObject(i as I, serializers))(i)
      ]
    ])(serializers)
  );
}

/**
 //TODO: Prepare console warnings for inconsistencies between serialization and deserialization.
 * i.e.: When using sub-serializers with non-object structure:
 * const input = {foo: 'bar'};
 * const serializers = [{from: 'foo', serializers: [{from: 'bar'}]}];
 * const output = serialize(input, serializers); // {foo: {bar: undefined}};
 * This is not possible to deserialize
 */
