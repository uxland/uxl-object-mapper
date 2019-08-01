import { Serializer } from '.';

export enum AbapBoolean {
  True = 'X',
  False = ''
}

export const SAPBooleanSerializer: Serializer<boolean, string> = {
  serialize: (value: string): boolean => value === AbapBoolean.True,
  deserialize: (value: boolean): string => (value ? AbapBoolean.True : AbapBoolean.False)
};
