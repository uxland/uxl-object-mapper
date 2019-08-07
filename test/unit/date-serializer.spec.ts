import { parse } from 'date-fns';
import * as R from 'ramda';
import { parseTimestamp, SAPDateSerializer, ValidationError } from '../../src/date-serializer';

describe('Date serializer', () => {
  describe('String formatters', () => {
    it('given a timestamp in "yyyymmddTHHmmss" format, output must be "yyyymmdd HHmmss"', () => {
      const timestamp = '20190215T102554';
      expect(parseTimestamp(timestamp)).toEqual(R.replace('T', ' ', timestamp));
    });
    it('given a timestamp in "yyyymmddTHHmm" format, output must be "yyyymmdd HHmm00"', () => {
      const timestamp = '20190215T1025';
      expect(parseTimestamp(timestamp)).toEqual(
        R.pipe(
          R.replace('T', ' '),
          i => R.concat(i, '00')
        )(timestamp)
      );
    });
    it('given a timestamp in "yyyymmddTHH" format, output must be "yyyymmdd HH0000"', () => {
      const timestamp = '20190215T10';
      expect(parseTimestamp(timestamp)).toEqual(
        R.pipe(
          R.replace('T', ' '),
          i => R.concat(i, '0000')
        )(timestamp)
      );
    });
    it('given a timestamp in format "yymmddTHHmmss" format, it must throw an invalid-date-format', () => {
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
    it('given a timestamp in "yyyymmddTHHmmss" format, it must return a date', () => {
      const timestamp = '20190101T102552';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(
        parse(R.replace('T', ' ', timestamp), 'yyyyMMdd HHmmss', new Date())
      );
    });
    it('given a timestamp in "yyyymmddTHHmm" format, it must return a date', () => {
      const timestamp = '20190101T1025';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(
        parse(R.replace('T', ' ', timestamp), 'yyyyMMdd HHmm', new Date())
      );
    });
    it('given a timestamp in "yyyymmddTHH" format, it must return a date', () => {
      const timestamp = '20190101T10';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(
        parse(R.replace('T', ' ', timestamp), 'yyyyMMdd HH', new Date())
      );
    });
    it('given a timestamp in "yyyymmdd HHmmss" format, it must return a date', () => {
      const timestamp = '20190101 102502';
      expect(SAPDateSerializer(timestamp)).toStrictEqual(parse(timestamp, 'yyyyMMdd HHmmss', new Date()));
    });
  });
  describe('Tester', () => {
    it('do', () => {
      const timestamp = '20190729T102550';
      console.log(parseTimestamp(timestamp));
      console.log(SAPDateSerializer(timestamp));
      const timestamp2 = '20191112T1504';
      console.log(parseTimestamp(timestamp2));
      console.log(SAPDateSerializer(timestamp2));
    });
  });
});
