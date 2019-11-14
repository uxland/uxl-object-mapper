import { isArray } from '.';
import { SerializerInfo } from './model';

export const invalidSerializerFn = 'invalid-serializer-fn';
export const requiredFrom = 'Serializer requires a from property';
export const requiredSerializeFn = 'required-serializer-fn';
export const invalidSerializerStructure = 'Cannot define serializerFn and serializers at the same time';
export const invalidPath = 'Path can only be used for objects and single object arrays';

export const validateSerializer = <S, D>(serializer: SerializerInfo<S, D>): SerializerInfo<S, D> => {
  if (!serializer.from) throw new Error(requiredFrom);
  if (serializer.from && isArray(serializer.from) && !isArray(serializer.to) && !serializer.serializerFn)
    throw new Error(requiredSerializeFn);
  if (serializer.serializerFn && serializer.serializers) throw new Error(invalidSerializerStructure);
  return serializer;
};
export const validateSerializers = <S, D>(serializers: SerializerInfo<S, D>[]): SerializerInfo<S, D>[] =>
  serializers?.map(s => validateSerializer(s));

export const validSerializers = <S, L>(serializers: SerializerInfo<S, L>[]): SerializerInfo<S, L>[] =>
  validateSerializers<S, L>(serializers);
export const invalidSerializers = <S, L>(serializers: SerializerInfo<S, L>[]): boolean =>
  !validSerializers(serializers);
