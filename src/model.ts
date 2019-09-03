export interface SerializerInfo<I, O> {
  from: string | string[];
  to?: string | string[];
  serializerFn?: (...args: any | I) => O;
  serializers?: SerializerInfo<any, any>[];
}
