export enum AbapBoolean {
  True = 'X',
  False = ''
}

export const SAPBooleanSerializer = (value: string): boolean => value === AbapBoolean.True;
export const SAPBooleanDeserializer = (value: boolean): string => (value ? AbapBoolean.True : AbapBoolean.False);
