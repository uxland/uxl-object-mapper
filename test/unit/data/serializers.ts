import { SAPBooleanSerializer } from '../../../src/boolean-serializer';

export const serializers: any = [
  { from: 'ID', to: 'id' },
  { from: 'DATE', to: '_date' },
  { from: 'TIME', to: '_time' },
  { from: 'DESCRIPTION', to: 'description' },
  { from: 'TYPE', to: 'type' },
  { from: 'STATUS', to: 'status' },
  { from: 'UNIT', to: 'unit' },
  { from: 'CASE', to: 'case' },
  { from: 'SERVICE', to: 'service' },
  {
    from: 'OWNER',
    to: 'owner',
    serializers: [
      { from: 'OWNERID', to: 'ownerId' },
      { from: 'OWNERNAME', to: 'ownerName' },
      { from: 'OWNERSURNAME', to: 'ownerSurname' },
      { from: 'OWNERSPECIALITY', to: 'ownerSpeciality' },
      { from: 'OWNERJOB', to: 'ownerJob' }
    ]
  },
  {
    from: 'RELEVANT',
    to: 'relevant',
    serializers: [
      { from: 'OWNER', to: 'owner' },
      { from: 'SERVICE', to: 'service' },
      { from: 'DATE', to: '_date' },
      { from: 'TIME', to: '_time' },
      { from: 'date' }
    ]
  },
  { from: 'HAS_INTERNAL_PDF', to: 'hasInternalPdf', serializerFn: SAPBooleanSerializer },
  { from: 'URL', to: 'url' },
  { from: 'PDF', to: 'pdf' },
  { from: 'CPC', to: 'cpc' },
  { from: 'PATNR', to: 'patientId' },
  { from: ['DATE', 'TIME'], to: 'dateTime', serializerFn: (date, time) => `${date}${time}` }
];
