export interface SerializerInfo<I, O> {
  from: string | string[];
  to?: string | string[];
  serializerFn?: (input: I) => O;
  serializers?: SerializerInfo<any, any>[];
}
