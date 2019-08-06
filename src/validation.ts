import { SerializerInfo } from './model';

export const invalidSerializerFn = 'invalid-serializer-fn';
export const requiredFrom = 'Serializer requires a from property';
export const requiredSerializeFn = 'required-serializer-fn';
export const invalidSerializerStructure = 'Cannot define serializerFn and serializers at the same time';
export const invalidPath = 'Path can only be used for objects and single object arrays';

export const validateSerializers = <S, D>(serializers: SerializerInfo<S, D>[]): boolean => {
  serializers.forEach(s => {
    if (!s.from) throw new Error(requiredFrom);
    if (s.serializerFn && s.serializers) throw new Error(invalidSerializerStructure);
  });
  return true;
};

export const validSerializers = <S, L>(serializers: SerializerInfo<S, L>[]): boolean =>
  validateSerializers<S, L>(serializers);
export const invalidSerializers = <S, L>(serializers: SerializerInfo<S, L>[]): boolean =>
  !validSerializers(serializers);
