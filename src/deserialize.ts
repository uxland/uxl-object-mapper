import R from 'ramda';
import {
  hasBoth,
  hasDeserializeProp,
  hasSerializerFn,
  invalidSerializerFn,
  isArray,
  isFalse,
  isInitial,
  isTrue,
  SerializerInfo
} from '.';
import { validateSerializers } from './validation';

const isObject = R.is(Object);
const validMultiple = (result: any, keys: string[]) => R.and(isObject(result), isArray(keys));
const validSimple = (result: any, keys: string) => R.not(isArray(keys));

const findDeserializer = <S, D>(serializers: SerializerInfo<S, D>[]) => (key: string) =>
  R.find(R.propEq('serializeProp', key))(serializers);
const deserializeInputProperty = <S, D>(input: S, output: D, originKey: keyof S, destKey: string[] | string) =>
  R.ifElse(
    R.is(Array),
    () => R.reduce((output, k) => moveInputProperty(input, output, originKey, k), output, destKey as string[]),
    R.always(moveInputProperty(input, output, originKey, destKey as string))
  )(destKey);

const moveInputProperty = <S, D>(input: S, output: D, originKey: keyof S, destKey?: string): D =>
  R.set(R.lensProp((destKey || originKey) as string), R.prop(originKey, input), output);
const assignValue = <S, D>(output: D, value: any, key: string | string[]) =>
  R.ifElse(
    isArray,
    () =>
      R.reduce(
        (collection, k) => R.set(R.lensProp(k as string), R.prop(k, value), collection),
        output,
        key as string[]
      ),
    () => R.set(R.lensProp(key as string), value, output)
  )(key);
const getDeserializerFn: Function = R.path(['serializerFn', 'deserialize']);
const executeDeserializerFn = <S, D>(input: S, output: D, k: string & keyof S, s: SerializerInfo<S, D>) =>
  R.set(R.lensProp(k), getDeserializerFn(s)(R.prop(k, input)), output);
const fullDeserialization = (input, output, k, s) => {
  let r = getDeserializerFn(s)(R.prop(k, input), R.prop('deserializeProp', s));
  let deserializeProp = R.prop('deserializeProp', s);
  return R.cond([
    [validMultiple, () => assignValue(output, r, deserializeProp)],
    [validSimple, () => assignValue(output, r, deserializeProp)],
    [
      R.T,
      () => {
        throw new Error(invalidSerializerFn);
      }
    ]
  ])(r, deserializeProp);
};

const performDeserialization = <S, D>(input: S, output: D, k: string & keyof S) => (serializer: SerializerInfo<S, D>) =>
  R.cond([
    [hasBoth, () => fullDeserialization(input, output, k, serializer)],
    [hasDeserializeProp, () => deserializeInputProperty(input, output, k, R.prop('deserializeProp', serializer))],
    [hasSerializerFn, () => executeDeserializerFn(input, output, k, serializer)],
    [R.T, R.always(input)]
  ])(serializer);

const proceedDeserialization = <S, D>(input: S, serializers: SerializerInfo<S, D>[]): D =>
  R.reduce(
    (output: D, k: string & keyof S) =>
      R.pipe(
        findDeserializer(serializers),
        R.ifElse(R.isNil, R.always(moveInputProperty(input, output, k)), performDeserialization(input, output, k))
      )(k as string),
    {} as D,
    R.keys(input) as (keyof S)[]
  );

const deserializeInput = <S, D>(input: S) => (serializers: SerializerInfo<S, D>[]): D =>
  R.pipe(
    validateSerializers,
    R.cond([
      [isTrue, () => proceedDeserialization(input, serializers)],
      [isFalse, R.always(undefined)],
      [R.T, R.always(undefined)]
    ])
  )(serializers);

export const deserialize = <S, D>(input: S, serializers?: SerializerInfo<S, D>[]): D =>
  R.cond([[isInitial, R.always(input)], [R.T, deserializeInput(input)]])(serializers);
