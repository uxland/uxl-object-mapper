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

export const validateSerializers = <S, D>(serializers: SerializerInfo<S, D>[]): boolean => {
  serializers.forEach(s => {
    if (!s.serializeProp) throw new Error(invalidSerializeProp);
  });
  return true;
};

const findSerializer = <S, D>(serializers: SerializerInfo<S, D>[]) => (key: string) =>
  R.find(R.propEq('serializeProp', key))(serializers);
const inputPassThrough = (input, output, k) => R.set(R.lensProp(k), R.prop(k, input), output);
const moveInputProperty = (input, output, originKey, destKey) =>
  R.set(R.lensProp(destKey), R.prop(originKey, input), output) && delete output[originKey];
const executeDeserializerFn = (input, output, k, s) => {
  console.log('in executeDeserializerFn', s);
  let fn = R.path(['serializerFn', 'deserialize']);
  // console.log(fn(R.prop(k, input)));
  let r = R.set(R.lensProp(k), R.path(['serializerFn', 'deserialize'])(R.prop(k, input)), output);
  // console.log(input, r);
  return r;
};
const hasDeserializeProp = R.has('deserializeProp');
const hasSerializerFn = s => {
  let r = R.has('serializerFn')(s);
  console.log(r, s);
  return r;
};
const hasBoth = s => R.and(hasSerializerFn(s), hasDeserializeProp(s));
const performDeserialization = (input, output, k) => s => {
  let r = null;
  r = R.cond([
    [hasBoth, () => console.log('has deserialize & deserializeProp')],
    [hasDeserializeProp, () => moveInputProperty(input, output, k, R.prop('deserializeProp', s))], //TODO: when isArray(deserializeProp)
    [hasSerializerFn, () => executeDeserializerFn(input, output, k, s)],
    [R.complement(hasBoth), () => inputPassThrough(input, output, k)]
  ])(s);
  // console.log(r);
  // let a = R.pipe(
  //   R.has('deserializeProp'),
  //   R.cond([[isTrue, R.always(R.prop('deserializeProp', s))], [isFalse, () => console.log('no')]])
  // )(s);
  // if (a) r = R.set(R.lensProp(a), R.prop(k, input), output);
  // delete input[k];
  // console.log(a);
  return r;
};
const proceedDeserialization = ({ input, serializers }) => {
  let output = { ...input };
  R.forEach(
    (k: string) =>
      R.pipe(
        findSerializer(serializers),
        R.cond([
          [R.isNil, R.always(inputPassThrough(input, output, k))],
          [isNotNil, performDeserialization(input, output, k)]
        ])
      )(k),
    R.keys(input)
  );
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
