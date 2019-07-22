import * as R from 'ramda';

export interface SerializerInfo<S, D> {
  serializeProp: string;
  deserializeProp?: string | string[];
  serializerFn?: Serializer<any, any>;
}
export interface Serializer<S, D> {
  serialize?: (input: D, fields?: string[]) => S;
  deserialize?: (input: S, fields?: string[]) => D;
}

export const invalidSerializerFn = 'invalid-serializer-fn';
export const invalidSerializeProp = 'invalid-serialize-prop';
export const requiredSerializeFn = 'required-serializer-fn';

const isTrue = R.equals(true);
const isFalse = R.equals(false);
const isInitial = <S, D>(serializers: Serializer<D, S>) => R.either(R.isNil, R.isEmpty)(serializers);
const isArray = R.is(Array);
const isObject = R.is(Object);
const validMultiple = (result: any, keys: string[]) => R.and(isObject(result), isArray(keys));
const validSimple = (result: any, keys: string) => R.not(isArray(keys));
const hasDeserializeProp = R.has('deserializeProp');
const hasSerializerFn = R.has('serializerFn');
const hasBoth = <S, D>(serializer: SerializerInfo<S, D>) =>
  R.and(hasSerializerFn(serializer), hasDeserializeProp(serializer));

export const validateSerializers = <S, D>(serializers: SerializerInfo<S, D>[]): boolean => {
  serializers.forEach(s => {
    if (!s.serializeProp) throw new Error(invalidSerializeProp);
  });
  return true;
};

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
const executeDeserializerFn = (input, output, k, s) =>
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

const performDeserialization = <S, D>(input: S, output: D, k: keyof S) => (serializer: SerializerInfo<S, D>) =>
  R.cond([
    [hasBoth, () => fullDeserialization(input, output, k, serializer)],
    [hasDeserializeProp, () => deserializeInputProperty(input, output, k, R.prop('deserializeProp', serializer))],
    [hasSerializerFn, () => executeDeserializerFn(input, output, k, serializer)],
    [R.T, R.always(input)]
  ])(serializer);

const proceedDeserialization = <S, D>(input: S, serializers: SerializerInfo<S, D>[]): D =>
  R.reduce(
    (output: D, k: keyof S) =>
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

const getSerializerFn: Function = R.path(['serializerFn', 'serialize']);
const executeSerializerFn = (input, output, k, s) => R.set(R.lensProp(k), getSerializerFn(s)(R.prop(k, input)), output);
const serializeInputProperty = <S, D>(input: D, output: S, k: keyof D, serializer: SerializerInfo<S, D>): S => {
  let deserializeProp = R.prop('deserializeProp', serializer);
  let serializeProp = R.prop('serializeProp', serializer);
  let serializerFn = getSerializerFn(serializer);
  let values = R.reduce(
    (values, key: keyof D) => values.concat(R.prop(key, input)),
    [],
    deserializeProp as (keyof D)[]
  );
  return R.cond([
    [
      R.allPass([isArray, () => R.isNil(serializerFn), () => R.equals(R.length(R.uniq(values)), 1)]),
      R.always(R.set(R.lensProp(serializeProp), R.prop(k, input), output))
    ],
    [
      R.allPass([isArray, () => R.isNil(serializerFn), () => R.gt(R.length(R.uniq(values)), 1)]),
      () => {
        throw new Error(requiredSerializeFn);
      }
    ],
    [R.T, R.always(R.set(R.lensProp(serializeProp), R.prop(k, input), output))]
  ])(deserializeProp);
};

const fullSerialization = <S, D>(input: D, output: S, k: keyof D, s: SerializerInfo<S, D>): S => {
  let result = R.cond([
    [
      isArray,
      () =>
        getSerializerFn(s)(
          R.reduce((data, k: keyof D) => R.set(R.lensProp(k), R.prop(k, input), data), {}, R.prop(
            'deserializeProp',
            s
          ) as (keyof D)[]),
          R.prop('deserializeProp', s)
        )
    ],
    [R.T, () => getSerializerFn(s)(R.prop(k, input), R.prop('deserializeProp', s))]
  ])(R.prop('deserializeProp', s));
  return R.set(R.lensProp(R.prop('serializeProp', s)), result, output);
};

const performSerialization = <S, D>(input: D, output: S, k: keyof D) => (serializer: SerializerInfo<S, D>) =>
  R.cond([
    [hasBoth, () => fullSerialization(input, output, k, serializer)],
    [hasDeserializeProp, () => serializeInputProperty(input, output, k, serializer)],
    [hasSerializerFn, () => executeSerializerFn(input, output, k, serializer)],
    [R.T, R.always(input)]
  ])(serializer);

const findSerializer = <S, D>(serializers: SerializerInfo<S, D>[]) => (key: string) => {
  const serializerDictionary: { [key: string]: SerializerInfo<S, D> } = R.reduce(
    (collection, s) => {
      if (!R.is(Array, s.deserializeProp)) collection[(s.deserializeProp as string) || s.serializeProp] = s;
      else (s.deserializeProp as string[]).forEach(p => (collection[p] = s));
      return collection;
    },
    {},
    serializers
  );
  return R.prop(key, serializerDictionary);
};

const proceedSerialization = <S, D>(input: D, serializers: SerializerInfo<S, D>[]): S =>
  R.reduce(
    (output: S, k: keyof D) =>
      R.pipe(
        findSerializer(serializers),
        R.ifElse(
          R.isNil,
          R.always(moveInputProperty<D, S>(input, output, k)),
          performSerialization(input, output as any, k)
        )
      )(k as string),
    {} as S,
    R.keys(input) as (keyof D)[]
  );

const serializeInput = <S, D>(input: D) => (serializers: SerializerInfo<S, D>[]): S =>
  R.pipe(
    validateSerializers,
    R.cond([
      [isTrue, () => proceedSerialization(input, serializers)],
      [isFalse, R.always(undefined)],
      [R.T, R.always(undefined)]
    ])
  )(serializers);

export const serialize = <D, S>(input: D, serializers?: SerializerInfo<D, S>[]): S =>
  R.cond([[isInitial, R.always(input)], [R.T, serializeInput(input)]])(serializers);
