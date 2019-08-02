import { Chance } from 'chance';
import { format } from 'date-fns';
import { serialize, SerializerInfo } from '../../src';

const chance = new Chance();

describe('Complex testing', () => {
  it('test', () => {
    const input = mockPatientIQ();
    const DateSerializer = {
      serialize: (stringDate: string) => new Date(stringDate)
    };
    const cellSerializers = [
      {
        serializeProp: 'TIMESTAMP',
        deserializeProp: 'timestamp',
        serializerFn: DateSerializer
      },
      { serializeProp: 'COMMENT', deserializeProp: 'comment' },
      {
        serializeProp: 'OWNER',
        deserializeProp: 'owner',
        serializers: [
          { serializeProp: 'ID', deserializeProp: 'id' },
          { serializeProp: 'NAME', deserializeProp: 'name' },
          { serializeProp: 'SURNAME', deserializeProp: 'surname' }
        ]
      },
      { serializeProp: 'INIT', deserializeProp: 'init', serializerFn: DateSerializer },
      { serializeProp: 'END', deserializeProp: 'end', serializerFn: DateSerializer },
      { serializeProp: 'VALUE', deserializeProp: 'value' },
      { serializeProp: 'UNIT', deserializeProp: 'unit' },
      { serializeProp: 'ABNORMALITY', deserializeProp: 'abnormality' }
    ];
    const itemSerializers = [
      { serializeProp: 'CODE', deserializeProp: 'code' },
      { serializeProp: 'DESCRIPTION', deserializeProp: 'description' },
      {
        serializeProp: 'CELL',
        deserializeProp: 'cell',
        serializers: cellSerializers
      }
    ];
    const serializers: SerializerInfo<any, any>[] = [
      {
        serializeProp: 'EVENTS',
        deserializeProp: 'events',
        serializers: itemSerializers
      },
      {
        serializeProp: 'TECHNIQUES',
        deserializeProp: 'techniques',
        serializers: itemSerializers
      },
      {
        serializeProp: 'PARAMETERS',
        deserializeProp: 'parameters',
        serializers: itemSerializers
      }
    ];
    let r = serialize(input, serializers);
    console.log(r);
  });
});

const date = new Date();
const buildPatientIQCell = () => ({
  TIMESTAMP: `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm:ss')}`,
  COMMENT: chance.sentence(),
  OWNER: {
    ID: 'NABIO',
    NAME: 'Sol.licitant',
    SURNAME: 'Sol.licitant'
  },
  INIT: `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm:ss')}`,
  END: `${format(date, 'yyyy-MM-dd')}T${format(date, 'HH:mm:ss')}`,
  VALUE: '',
  UNIT: '',
  ABNORMALITY: ''
});

const buildPatientIQCells = () => buildArray(buildPatientIQCell);

const buildPatientIQItem = () => ({
  CODE: chance.guid(),
  DESCRIPTION: chance.sentence(),
  CELL: buildPatientIQCells()
});

const buildArray = (fn: any) => {
  let items: any[] = [];
  for (let i = 0; i < Math.random() * Math.floor(5); i++) {
    items.push(fn());
  }
  return items;
};

const buildPatientIQItems = () => buildArray(buildPatientIQItem);

const mockPatientIQ = () => ({
  EVENTS: buildPatientIQItems(),
  TECHNIQUES: buildPatientIQItems(),
  PARAMETERS: buildPatientIQItems()
});
