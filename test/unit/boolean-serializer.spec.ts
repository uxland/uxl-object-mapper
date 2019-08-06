import { AbapBoolean, SAPBooleanDeserializer, SAPBooleanSerializer } from '../../src/boolean-serializer';

describe('Boolean serializer', () => {
  describe('SAP Boolean Serializer', () => {
    it('deserialize must return "X" when value is true', () => {
      expect(SAPBooleanDeserializer(true)).toBe(AbapBoolean.True);
    });
    it('deserialize must return "" when value is false', () => {
      expect(SAPBooleanDeserializer(false)).toBe(AbapBoolean.False);
    });
    it('serialize must return true when value is "X"', () => {
      expect(SAPBooleanSerializer(AbapBoolean.True)).toBe(true);
    });
    it('serialize must return false when value is ""', () => {
      expect(SAPBooleanSerializer(AbapBoolean.False)).toBe(false);
    });
  });
});
