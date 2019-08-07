import { parse } from 'date-fns';
import * as R from 'ramda';

export const enum ValidationError {
  InvalidDateFormat = 'Date must be in format yyyyMMdd.',
  InvalidDateValue = 'Date must be a number',
  InvalidTimeFormat = 'Time must be in format hhmmss, hhmm or hh.',
  InvalidTimeValue = 'Time must be a number'
}

const thrower = msg => {
  throw new Error(msg);
};

const isNumber = R.pipe(
  parseInt,
  R.complement(R.equals(NaN))
);

const hasTSeparator = R.pipe(
  R.indexOf('T'),
  R.equals(-1),
  R.not
);
const splitTimestamp = timestamp =>
  R.cond([[hasTSeparator, R.always(R.split('T', timestamp))], [R.T, R.always(R.split(' ', timestamp))]])(timestamp);
const parseDate = (date: string) =>
  R.pipe(
    R.length,
    R.cond([[R.equals(8), R.always(date)], [R.T, () => thrower(ValidationError.InvalidDateFormat)]])
  )(date);
const validateDate = R.cond([[isNumber, parseDate], [R.T, () => thrower(ValidationError.InvalidDateValue)]]);

const parseTime = (time: string) =>
  R.pipe(
    R.length,
    R.cond([
      [R.equals(6), R.always(time)],
      [R.equals(4), R.always(R.concat(time, '00'))],
      [R.equals(2), R.always(R.concat(time, '0000'))],
      [R.T, () => thrower(ValidationError.InvalidTimeFormat)]
    ])
  )(time);
const validateTime = R.cond([[isNumber, parseTime], [R.T, () => thrower(ValidationError.InvalidTimeValue)]]);

const validateTimestamp = R.pipe(
  R.adjust(0, validateDate),
  R.adjust(1, validateTime)
);
export const parseTimestamp = R.pipe(
  splitTimestamp,
  validateTimestamp,
  R.join(' ')
);

export const SAPDateSerializer = (timestamp: string) => parse(parseTimestamp(timestamp), 'yyyyMMdd hhmmss', new Date());
