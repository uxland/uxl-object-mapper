import * as R from 'ramda';

export interface SerializerInfo<S, D> {
  serializeProp: string;
  deserializeProp?: string | string[];
  serializerFn?: Serializer<S, D>;
  serializers?: SerializerInfo<S, D>[];
}
export interface Serializer<S, D> {
  serialize?: (input: D, fields?: string[]) => S;
  deserialize?: (input: S, fields?: string[]) => D;
}

export const invalidSerializerFn = 'invalid-serializer-fn';
export const invalidSerializeProp = 'invalid-serialize-prop';
export const requiredSerializeFn = 'required-serializer-fn';
export const invalidSerializerStructure = 'invalid-serializer-structure';

export const hasDeserializeProp = R.has('deserializeProp');
export const hasSerializerFn = R.has('serializerFn');
export const hasSerializers = R.has('serializers');
export const hasBoth = <S, D>(serializer: SerializerInfo<S, D>) =>
  R.and(hasSerializerFn(serializer), hasDeserializeProp(serializer));
export const isTrue = R.equals(true);
export const isFalse = R.equals(false);
export const isInitial = <S, D>(serializers: Serializer<D, S>) => R.either(R.isNil, R.isEmpty)(serializers);
export const isArray = R.is(Array);

export * from './boolean-serializer';
export * from './date-serializer';
export * from './deserialize';
export * from './serialize';
export * from './validation';
