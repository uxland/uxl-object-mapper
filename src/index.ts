import * as R from 'ramda';

export interface SerializerInfo<S, D> {
  serializeProp: string | string[];
  deserializeProp?: string;
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

export const isTrue = R.equals(true);
export const isFalse = R.equals(false);
export const isInitial = (object: any) => R.either(R.isNil, R.isEmpty)(object);
export const isArray = R.is(Array);

export const hasDeserializeProp = R.has('deserializeProp');
export const hasSerializerFn = R.has('serializerFn');
export const hasSerializers = R.has('serializers');
export const hasBoth = R.allPass([hasDeserializeProp, hasSerializerFn]);
export const hasInvalidStructure = R.allPass([hasSerializerFn, hasSerializers]);
export const multipleSerializeProp = R.pipe(
  R.prop('serializeProp'),
  isArray
);
export const hasInvalidSerializerFn = s => {
  console.log(R.prop('serializeProp')(s), multipleSerializeProp(s));
  return false;
};
export const hasDeserializePropAndSerializerFn = <S, D>(serializer: SerializerInfo<S, D>) =>
  R.and(hasSerializerFn(serializer), hasDeserializeProp(serializer));

export * from './boolean-serializer';
export * from './date-serializer';
export * from './deserialize';
export * from './serialize';
export * from './validation';
