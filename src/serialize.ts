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
const inputPassThrough = (input, output, k) => R.set(R.lensProp(k), R.prop(k, input), output);
const assignInputToOutput = (input, output, originKey, destKey: string[] | string) =>
  R.ifElse(
    R.is(Array),
    () => {
      let r = {};
      R.forEach(
        k => {
          r = R.set(R.lensProp(k), R.prop(originKey, input), r);
        },
        destKey as string[]
      );
      return R.merge(output, r);
    },
    R.always(moveInputProperty(input, output, originKey, destKey))
  )(destKey);

const moveInputProperty = (input, output, originKey, destKey) =>
  R.set(R.lensProp(destKey as string), R.prop(originKey, input), output);
const executeDeserializerFn = (input, output, k, s) =>
  R.set(R.lensProp(k), (R.path(['serializerFn', 'deserialize'])(s) as Function)(R.prop(k, input)), output);
const fullDeserialization = (input, output, k, s) =>
  R.set(
    R.lensProp(R.prop('deserializeProp', s)),
    (R.path(['serializerFn', 'deserialize'])(s) as Function)(R.prop(k, input)),
    output
  );
const hasDeserializeProp = R.has('deserializeProp');
const hasSerializerFn = R.has('serializerFn');
const hasBoth = s => R.and(hasSerializerFn(s), hasDeserializeProp(s));

const performDeserialization = (input, output, k) => s =>
  R.cond([
    [hasBoth, () => fullDeserialization(input, output, k, s)],
    [hasDeserializeProp, () => assignInputToOutput(input, output, k, R.prop('deserializeProp', s))],
    [hasSerializerFn, () => executeDeserializerFn(input, output, k, s)],
    [R.T, R.always(input)]
  ])(s);

const proceedDeserialization = ({ input, serializers }) => {
  let output: any = {};
  R.forEach((k: string) => {
    output = R.pipe(
      findSerializer(serializers),
      R.ifElse(
        R.isNil,
        R.always(R.set(R.lensProp(k), R.prop(k, input), output)),
        performDeserialization(input, output, k)
      )
    )(k);
    return output;
  }, R.keys(input));
  console.log(input, output);
  return output;
};

export const deserialize = <S, D>(input: S, serializers?: SerializerInfo<S, D>[]): D => {
  let r = R.pipe(
    isInitial,
    R.ifElse(isTrue, R.always(input), () => validateSerializers(serializers)),
    R.cond([
      [isTrue, () => proceedDeserialization({ input, serializers })],
      [isFalse, R.always(undefined)],
      [R.T, R.always(input)]
    ])
  )(serializers);
  return r as any;
};

// export const deserialize = <S, D>(input: S, serializers?: SerializerInfo<S, D>[]): D => {
//   let output: D = {} as any;
//   if (!serializers || serializers.length == 0) return (output = { ...input } as any);
//   validateSerializers(serializers) &&
//     Object.keys(input).forEach(k => {
//       let s = serializers && serializers.find(s => s.serializeProp == k);
//       if (s) {
//         let result;
//         if (s.serializerFn && s.serializerFn.deserialize)
//           result = s.serializerFn.deserialize(
//             input[k],
//             is(Array, s.deserializeProp) && (s.deserializeProp as string[])
//           );
//         const prop = s.deserializeProp || k;
//         if (typeof prop === 'string') output[prop] = result || input[k];
//         else {
//           if (!isNil(result) && result instanceof Object === false) throw new Error(invalidSerializerFn);
//           prop.forEach(p => (output[p] = result ? result[p] : input[k]));
//         }
//       } else output[k] = input[k];
//     });
//   return output;
// };
