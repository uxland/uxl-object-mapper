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

const isNotNil = R.complement(R.isNil);
const isTrue = R.equals(true);
const isFalse = R.equals(false);
const isInitial = <S, D>(serializers: Serializer<D, S>) => R.either(R.isNil, R.isEmpty)(serializers);
const isArray = R.is(Array);
const isObject = R.is(Object);
const validMultiple = (result: any, keys: string[]) => R.and(isObject(result), isArray(keys));
const validSimple = (result: any, keys: string) => R.not(isArray(keys));

export const validateSerializers = <S, D>(serializers: SerializerInfo<S, D>[]): boolean => {
  serializers.forEach(s => {
    if (!s.serializeProp) throw new Error(invalidSerializeProp);
  });
  return true;
};

export const serialize = <D, S>(input: D, serializers?: SerializerInfo<D, S>[]): S => {
  let output: S = {} as any;
  if (!serializers || serializers.length == 0) return (output = { ...input } as any);
  const serializerDictionary = serializers.reduce((collection, s) => {
    if (!R.is(Array, s.deserializeProp)) collection[(s.deserializeProp as string) || s.serializeProp] = s;
    else (s.deserializeProp as string[]).forEach(p => (collection[p] = s));
    return collection;
  }, {});

  Object.keys(input).forEach(k => {
    let result;
    const s = serializerDictionary[k];
    if ((s && s.deserializeProp && !R.is(Array, s.deserializeProp)) || (s && !s.deserializeProp))
      result = s && s.serializerFn && s.serializerFn.serialize && s.serializerFn.serialize(input[k]);
    else if (s && s.deserializeProp && R.is(Array, s.deserializeProp)) {
      const serializerPayload = s.deserializeProp.reduce((payload, p) => ({ ...payload, [p]: input[p] }), {});
      if (s && !s.serializerFn && R.uniq(Object.values(serializerPayload)).length > 1)
        throw new Error(requiredSerializeFn);
      result =
        s &&
        s.serializerFn &&
        s.serializerFn.serialize &&
        s.serializerFn.serialize(serializerPayload, R.is(Array, s.deserializeProp) && (s.deserializeProp as string[]));
    }
    output[(s && s.serializeProp) || k] = result || input[k];
  });
  return output;
};

const findSerializer = <S, D>(serializers: SerializerInfo<S, D>[]) => (key: string) =>
  R.find(R.propEq('serializeProp', key))(serializers);
const assignInputToOutput = (input, output, originKey, destKey: string[] | string) =>
  R.ifElse(
    R.is(Array),
    () => {
      let r = {};
      R.forEach(k => (r = moveInputProperty(input, r, originKey, k)), destKey as string[]);
      return R.merge(output, r);
    },
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
const hasDeserializeProp = R.has('deserializeProp');
const hasSerializerFn = R.has('serializerFn');
const hasBoth = <S, D>(serializer: SerializerInfo<S, D>) =>
  R.and(hasSerializerFn(serializer), hasDeserializeProp(serializer));

const performDeserialization = <S, D>(input: S, output: D, k: keyof S) => (serializer: SerializerInfo<S, D>) =>
  R.cond([
    [hasBoth, () => fullDeserialization(input, output, k, serializer)],
    [hasDeserializeProp, () => assignInputToOutput(input, output, k, R.prop('deserializeProp', serializer))],
    [hasSerializerFn, () => executeDeserializerFn(input, output, k, serializer)],
    [R.T, R.always(input)]
  ])(serializer);

const proceedDeserialization = <S, D>(input: S, serializers: SerializerInfo<S, D>[]): D =>
  R.reduce(
    (output: D, k: keyof S) =>
      R.pipe(
        findSerializer(serializers),
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
