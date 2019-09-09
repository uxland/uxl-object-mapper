import * as R from 'ramda';

export const isTrue = R.equals(true);
export const isFalse = R.equals(false);
export const isInitial = (object: any) => R.either(R.isNil, R.isEmpty)(object);
export const notInitial = (object: any) => R.complement(isInitial)(object);
export const isArray = R.is(Array);
export const isObject = R.allPass([R.complement(isArray), R.is(Object)]);

export const hasDeserializeProp = R.has('deserializeProp');
export const hasSerializerFn = R.has('serializerFn');
export const hasSerializers = R.has('serializers');
export const hasBoth = R.allPass([hasDeserializeProp, hasSerializerFn]);
export const hasInvalidStructure = R.allPass([hasSerializerFn, hasSerializers]);
export const multipleSerializeProp = R.pipe(
  R.prop('serializeProp'),
  isArray
);

export * from './boolean-serializer';
export * from './date-serializer';
export * from './deserialize';
export * from './model';
export * from './serialize';
export * from './validation';
