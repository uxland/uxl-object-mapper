import { parse } from 'date-fns';
import * as R from 'ramda';
import { parseTimestamp, SAPDateSerializer, ValidationError } from '../../src/date-serializer';

describe('Date serializer', () => {
  describe('String formatters', () => {
    it('given a timestamp in "yyyymmddThhmmss" format, output must be "yyyymmdd hhmmss"', () => {
      const timestamp = '20190215T102554';
      expect(parseTimestamp(timestamp)).toEqual(R.replace('T', ' ', timestamp));
    });
    it('given a timestamp in "yyyymmddThhmm" format, output must be "yyyymmdd hhmm00"', () => {
      const timestamp = '20190215T1025';
      expect(parseTimestamp(timestamp)).toEqual(
        R.pipe(
          R.replace('T', ' '),
          i => R.concat(i, '00')
        )(timestamp)
      );
    });
    it('given a timestamp in "yyyymmddThh" format, output must be "yyyymmdd hh0000"', () => {
      const timestamp = '20190215T10';
      expect(parseTimestamp(timestamp)).toEqual(
        R.pipe(
          R.replace('T', ' '),
          i => R.concat(i, '0000')
        )(timestamp)
      );
    });
    it('given a timestamp in format "yymmddThhmmss" format, it must throw an invalid-date-format', () => {
      const timestamp = '190215T102554';
      const parser = () => parseTimestamp(timestamp);
      expect(parser).toThrow(ValidationError.InvalidDateFormat);
    });
    it('if time in timestamp is invalid, it must throw an invalid-time-format', () => {
      const timestamp = '20190215T31293810';
      const parser = () => parseTimestamp(timestamp);
      expect(parser).toThrow(ValidationError.InvalidTimeFormat);
    });
    it('if date fragment in timestamp is not a number, it must throw an invalid-date-value', () => {
      const timestamp = 'foobarbaT102552';
      const parser = () => parseTimestamp(timestamp);
      expect(parser).toThrow(ValidationError.InvalidDateValue);
    });
    it('if time fragment in timestamp is not a number, it must throw an invalid-date-value', () => {
      const timestamp = '20190215Tfoobar';
      const parser = () => parseTimestamp(timestamp);
      expect(parser).toThrow(ValidationError.InvalidTimeValue);
    });
  });
  describe('SAPDateSerializer', () => {
    it('given a timestamp in "yyyymmddThhmmss" format, it must return a date', () => {
      const timestamp = '20190101T102552';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(
        parse(R.replace('T', ' ', timestamp), 'yyyyMMdd hhmmss', new Date())
      );
    });
    it('given a timestamp in "yyyymmddThhmm" format, it must return a date', () => {
      const timestamp = '20190101T1025';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(
        parse(R.replace('T', ' ', timestamp), 'yyyyMMdd hhmm', new Date())
      );
    });
    it('given a timestamp in "yyyymmddThh" format, it must return a date', () => {
      const timestamp = '20190101T10';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(
        parse(R.replace('T', ' ', timestamp), 'yyyyMMdd hh', new Date())
      );
    });
    it('given a timestamp in "yyyymmdd hhmmss" format, it must return a date', () => {
      const timestamp = '20190101 102502';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(parse(timestamp, 'yyyyMMdd hhmmss', new Date()));
    });
  });
});
