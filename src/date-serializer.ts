import { format } from 'date-fns';
import { Serializer } from './serialize';

export interface SAPDate {
  date: string;
  time: string;
}
export enum AbapDateFormats {
  Date = 'yyyy-MM-dd',
  Time = 'HH:mm:ss'
}
export const SAPDateSerializer: Serializer<Date, SAPDate> = {
  serialize: (input: SAPDate, fields?: string[]): Date =>
    new Date(`${input[(fields && fields[0]) || 'date']} ${input[(fields && fields[1]) || 'time']}`),
  deserialize: (input: Date, fields?: string[]): SAPDate | any => ({
    [(fields && fields[0]) || 'date']: format(input, AbapDateFormats.Date),
    [(fields && fields[1]) || 'time']: format(input, AbapDateFormats.Time)
  })
};
