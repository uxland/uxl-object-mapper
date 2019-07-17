import { is, isNil, uniq } from 'ramda';

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

export const serialize = <D, S>(input: D, serializers?: SerializerInfo<D, S>[]): S => {
  let output: S = {} as any;
  if (!serializers || serializers.length == 0) return (output = { ...input } as any);
  const serializerDictionary = serializers.reduce((collection, s) => {
    if (!is(Array, s.deserializeProp)) collection[(s.deserializeProp as string) || s.serializeProp] = s;
    else (s.deserializeProp as string[]).forEach(p => (collection[p] = s));
    return collection;
  }, {});

  Object.keys(input).forEach(k => {
    let result;
    const s = serializerDictionary[k];
    if ((s && s.deserializeProp && !is(Array, s.deserializeProp)) || (s && !s.deserializeProp))
      result = s && s.serializerFn && s.serializerFn.serialize && s.serializerFn.serialize(input[k]);
    else if (s && s.deserializeProp && is(Array, s.deserializeProp)) {
      const serializerPayload = s.deserializeProp.reduce((payload, p) => ({ ...payload, [p]: input[p] }), {});
      if (s && !s.serializerFn && uniq(Object.values(serializerPayload)).length > 1)
        throw new Error(requiredSerializeFn);
      result =
        s &&
        s.serializerFn &&
        s.serializerFn.serialize &&
        s.serializerFn.serialize(serializerPayload, is(Array, s.deserializeProp) && (s.deserializeProp as string[]));
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

export const deserialize = <S, D>(input: S, serializers?: SerializerInfo<S, D>[]): D => {
  let output: D = {} as any;
  if (!serializers || serializers.length == 0) return (output = { ...input } as any);
  validateSerializers(serializers) &&
    Object.keys(input).forEach(k => {
      let s = serializers && serializers.find(s => s.serializeProp == k);
      if (s) {
        let result;
        if (s.serializerFn && s.serializerFn.deserialize)
          result = s.serializerFn.deserialize(
            input[k],
            is(Array, s.deserializeProp) && (s.deserializeProp as string[])
          );
        const prop = s.deserializeProp || k;
        if (typeof prop === 'string') output[prop] = result || input[k];
        else {
          if (!isNil(result) && result instanceof Object === false) throw new Error(invalidSerializerFn);
          prop.forEach(p => (output[p] = result ? result[p] : input[k]));
        }
      } else output[k] = input[k];
    });
  return output;
};
