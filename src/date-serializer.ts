export interface SAPDate {
  date: string;
  time: string;
}
export enum AbapDateFormats {
  Date = 'yyyy-MM-dd',
  Time = 'HH:mm:ss'
}

// const isTimestamp = R.pipe(
//   R.indexOf('T'),
//   R.equals(-1)
// );
// const dateSlashFormatted = R.pipe(R.split('/'), R.length(3));
// const isValidDate = R.cond([]);
// const isDateTimeObject = R.allPass([R.has('date'), R.has('time')]);
// export const SAPDateSerializer = <I, O>(input: I & string): O => R.cond([[isTimestamp, () => new Date(input)]])(input);
// export const SAPDateSerializer: Serializer<Date, SAPDate> = {
//   serialize: (input: SAPDate, fields?: string[]): Date =>
//     new Date(`${input[(fields && fields[0]) || 'date']} ${input[(fields && fields[1]) || 'time']}`),
//   deserialize: (input: Date, fields?: string[]): SAPDate | any => ({
//     [(fields && fields[0]) || 'date']: format(input, AbapDateFormats.Date),
//     [(fields && fields[1]) || 'time']: format(input, AbapDateFormats.Time)
//   })
// };
