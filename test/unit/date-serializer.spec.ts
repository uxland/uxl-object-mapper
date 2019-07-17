import { format } from 'date-fns';
import { AbapDateFormats, SAPDateSerializer } from '../../src/date-serializer';

const dateConstant = new Date();
dateConstant.setMilliseconds(0);

describe('Date serializer', () => {
  describe('SAP Date serializer', () => {
    it('deserialize must convert Date into date and time', () => {
      const output = {
        date: format(dateConstant, AbapDateFormats.Date),
        time: format(dateConstant, AbapDateFormats.Time)
      };
      expect(SAPDateSerializer.deserialize(dateConstant)).toStrictEqual(output);
    });
    it('serialize must convert input date and time into a Date', () => {
      const input = {
        date: format(dateConstant, AbapDateFormats.Date),
        time: format(dateConstant, AbapDateFormats.Time)
      };
      expect(SAPDateSerializer.serialize(input)).toStrictEqual(dateConstant);
    });
  });
});
