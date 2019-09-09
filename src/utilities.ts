import * as R from 'ramda';
import { isArray, notInitial } from '.';
import { SerializerInfo } from './model';

export const thrower = (message: string) => {
  throw new Error(message);
};
export const getFrom = (serializer?: any): string | string[] => serializer && R.prop('from')(serializer);
export const getTo = (serializer?: any): string | string[] => serializer && R.prop('to')(serializer);
export const getSerializerFn = (serializer?: any): Function => serializer && R.prop('serializerFn')(serializer);
export const getDeserializerFn = (serializer?: any): Function => serializer && R.prop('deserializerFn')(serializer);
export const getSerializers = (serializer?: any): SerializerInfo<any, any>[] =>
  serializer && R.prop('serializers')(serializer);
export const hasFrom = R.pipe(
  getFrom,
  notInitial
);
export const hasTo = R.pipe(
  getTo,
  notInitial
);
export const hasSerializerFn = R.pipe(
  getSerializerFn,
  notInitial
);
export const hasDeserializerFn = R.pipe(
  getDeserializerFn,
  notInitial
);
export const hasSerializers = R.pipe(
  getSerializers,
  notInitial
);
export const hasFromTo = R.allPass([hasFrom, hasTo]);
export const isPath = R.pipe(
  R.indexOf('.'),
  R.complement(R.equals(-1))
);
export const isSingleObject = R.allPass([
  isArray,
  R.pipe(
    R.length,
    R.equals(1)
  )
]);
export const lensProp = (prop: string) =>
  R.ifElse(isPath, () => R.lensPath(R.split('.')(prop)), () => R.lensProp(prop))(prop);
