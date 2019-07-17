import { AbapBoolean, SAPBooleanSerializer } from '../../src/boolean-serializer';

describe('Boolean serializer', () => {
  describe('SAP Boolean Serializer', () => {
    it('deserialize must return "X" when value is true', () => {
      expect(SAPBooleanSerializer.deserialize(true)).toBe(AbapBoolean.True);
    });
    it('deserialize must return "" when value is false', () => {
      expect(SAPBooleanSerializer.deserialize(false)).toBe(AbapBoolean.False);
    });
    it('serialize must return true when value is "X"', () => {
      expect(SAPBooleanSerializer.serialize(AbapBoolean.True)).toBe(true);
    });
    it('serialize must return false when value is ""', () => {
      expect(SAPBooleanSerializer.serialize(AbapBoolean.False)).toBe(false);
    });
  });
});
