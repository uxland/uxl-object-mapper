export interface SerializerInfo<I, O, S = any, T = any> {
  from: keyof I | Array<keyof I>;
  to?: keyof O | Array<keyof O>;
  serializerFn?: (...args: I[keyof I][]) => O[keyof O];
  deserializerFn?: (...args: I[keyof I][]) => O[keyof O];
  serializers?: SerializerInfo<S, T>[];
}
