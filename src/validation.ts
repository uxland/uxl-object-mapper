import { invalidSerializeProp, invalidSerializerStructure, SerializerInfo } from '.';

export const validateSerializers = <S, D>(serializers: SerializerInfo<S, D>[]): boolean => {
  serializers.forEach(s => {
    if (!s.serializeProp) throw new Error(invalidSerializeProp);
    if (s.serializerFn && s.serializers) throw new Error(invalidSerializerStructure);
  });
  return true;
};
