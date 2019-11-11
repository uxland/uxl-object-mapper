import * as R from 'ramda';
import { isArray, isInitial, isObject } from '.';
import { SerializerInfo } from './model';
import {
  getFrom,
  getSerializerFn,
  getSerializers,
  getTo,
  hasFromTo,
  hasSerializerFn,
  hasSerializers,
  isPath,
  isSingleObject,
  setProperty,
  thrower
} from './utilities';
import { invalidPath, invalidSerializers } from './validation';

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
        ])(R.prop(R.split('.', from as string)[0], data))
    ],
    [R.T, () => R.prop(from as string, data)]
  ])(from);
const setOutput = (from: string, to: string, value: any) => (output: any = {}) =>
  setProperty(output, to || from, value);
const multipleTo = (data: any, from: string | string[], to: string[], fn: Function) =>
  R.cond([
    [R.equals, () => R.reduce((collection, toK: string) => inToOut(data, toK, toK, fn)(collection), {}, to)],
    [R.T, () => R.reduce((collection, toK: string) => inToOut(data, from, toK, fn)(collection), {}, to)]
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
    [hasSerializerFn, () => setOutput(from as string, to, executeFn(data, from, serializerFn))(output)],
    [hasSerializers, () => setOutput(from as string, to, serialize(data, serializers))(output)],
    [R.T, () => setOutput(from as string, to, data)(output)]
  ])({
    serializerFn,
    serializers
  });
const inToOut = (data: any, from: string | string[], to?: string | string[], fn?: Function, serializers?: any) => (
  output: any
) =>
  R.cond([
    [
      hasFromTo,
      () =>
        R.cond([
          [isArray, () => multipleTo(data, from, to as string[], fn)],
          [R.T, () => assignInputToOutput(getProp(from, data), from, to as string, fn, serializers)(output)]
          // [R.T, R.always(assignInputToOutput(getProp(from, data), from, to as string, fn, serializers)(output))]
        ])(to)
    ],
    [R.T, () => assignInputToOutput(getProp(from, data), from, undefined, fn, serializers)(output)]
    // [R.T, R.always(assignInputToOutput(getProp(from, data), from, undefined, fn, serializers)(output))]
  ])({
    from,
    to
  });

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
  return R.cond([
    [isInitial, () => i],
    [invalidSerializers, () => i],
    [
      R.T,
      () =>
        R.ifElse(isArray, () => serializeArray(i as I[], serializers), () => serializeObject(i as I, serializers))(i)
    ]
  ])(serializers);
}

/**
 * TODO: Prepare console warnings for inconsistencies between serialization and deserialization.
 * i.e.: When using sub-serializers with non-object structure:
 * const input = {foo: 'bar'};
 * const serializers = [{from: 'foo', serializers: [{from: 'bar'}]}];
 * const output = serialize(input, serializers); // {foo: {bar: undefined}};
 * This is not possible to deserialize
 */
