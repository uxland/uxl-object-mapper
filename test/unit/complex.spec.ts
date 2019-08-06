import * as R from 'ramda';
import { SerializerInfo } from '../../src';
import { serialize } from '../../src/serialize';
import ETQ from './etq.example';
import { IPatientIQ, ISAPIQEventGroup, ISAPPatientIQ } from './models';
import SAP from './sap.example';

let ownerSerializers;
describe('SAP - ETQ Mapper', () => {
  beforeAll(() => {
    ownerSerializers = [{ from: 'ID', to: 'id' }, { from: 'NAME', to: 'name' }, { from: 'SURNAME', to: 'surname' }];
  });
  it('serialize Events', () => {
    const serializers: SerializerInfo<ISAPPatientIQ, IPatientIQ>[] = [
      {
        from: 'EVENTS',
        to: 'events',
        serializers: [
          {
            from: 'CODE',
            to: ['id', 'value']
          },
          { from: 'DESCRIPTION', to: 'description' },
          { from: 'CELL.TIMESTAMP', to: 'timestamp' },
          { from: 'CELL.OWNER', to: 'owner', serializers: ownerSerializers },
          { from: 'CELL.COMMENT', to: 'comment' }
        ]
      }
    ];
    expect(serialize({ EVENTS: SAP.EVENTS }, serializers)).toStrictEqual({ events: ETQ.events });
  });
  it('serialize Techniques', () => {
    const cellSerializers: any = [
      { from: 'TIMESTAMP', to: 'timestamp' },
      { from: 'COMMENT', to: 'comment' },
      { from: 'OWNER', to: 'owner', serializers: ownerSerializers }
    ];
    const techniqueSerializers: any = [
      { from: 'CODE', to: ['id', 'value'] },
      { from: 'DESCRIPTION', to: 'description' }
    ];
    const serializers: SerializerInfo<any, any>[] = [
      {
        from: 'TECHNIQUES',
        to: 'techniques',
        serializerFn: (technique: ISAPIQEventGroup) =>
          R.reduce(
            (collection, cell) =>
              collection.concat({
                ...serialize(technique, techniqueSerializers),
                ...serialize(cell, cellSerializers)
              }),
            [],
            R.prop('CELL', technique)
          )
      }
    ];
    expect(serialize({ TECHNIQUES: SAP.TECHNIQUES }, serializers)).toStrictEqual({ techniques: ETQ.techniques });
  });
  it('serialize Parameters', () => {
    const serializers: SerializerInfo<ISAPPatientIQ, IPatientIQ>[] = [
      {
        from: 'PARAMETERS',
        to: 'parameters',
        serializers: [
          { from: 'CODE', to: 'id' },
          { from: 'DESCRIPTION', to: 'description' },
          {
            from: 'CELL',
            to: 'items',
            serializers: [
              { from: 'TIMESTAMP', to: 'timestamp' },
              { from: 'COMMENT', to: 'comment' },
              { from: 'OWNER', to: 'owner', serializers: ownerSerializers },
              { from: 'VALUE', to: 'value', serializerFn: (input: string) => parseFloat(input) } as any,
              { from: 'UNIT', to: 'unit' },
              { from: 'ABNORMALITY', to: 'abnormality' }
            ]
          }
        ]
      }
    ];
    expect(serialize({ PARAMETERS: SAP.PARAMETERS }, serializers)).toStrictEqual({ parameters: ETQ.parameters });
  });
  it('serialize Analytic', () => {
    const serializers: SerializerInfo<ISAPPatientIQ, IPatientIQ>[] = [
      {
        from: 'ANALYTIC',
        to: 'analytic',
        serializers: [
          { from: 'CODE', to: 'id' },
          { from: 'DESCRIPTION', to: 'description' },
          {
            from: 'CELL',
            to: 'items',
            serializers: [
              { from: 'TIMESTAMP', to: 'timestamp' },
              { from: 'COMMENT', to: 'comment' },
              { from: 'OWNER', to: 'owner', serializers: ownerSerializers },
              { from: 'VALUE', to: 'value', serializerFn: (input: string) => parseFloat(input) } as any,
              { from: 'UNIT', to: 'unit' },
              { from: 'ABNORMALITY', to: 'abnormality' }
            ]
          }
        ]
      }
    ];
    expect(serialize({ ANALYTIC: SAP.ANALYTIC }, serializers)).toStrictEqual({ analytic: ETQ.analytic });
  });
  it('serialize Airway', () => {
    const cellSerializers: any = [
      { from: 'INIT', to: 'init' },
      { from: 'END', to: 'end' },
      { from: 'COMMENT', to: 'comment' },
      { from: 'OWNER', to: 'owner', serializers: ownerSerializers }
    ];
    const techniqueSerializers: any = [
      { from: 'CODE', to: ['id', 'value'] },
      { from: 'DESCRIPTION', to: 'description' }
    ];
    const serializers: SerializerInfo<any, any>[] = [
      {
        from: 'AIRWAY',
        to: 'airway',
        serializerFn: (technique: ISAPIQEventGroup) =>
          R.reduce(
            (collection, cell) =>
              collection.concat({
                ...serialize(technique, techniqueSerializers),
                ...serialize(cell, cellSerializers)
              }),
            [],
            R.prop('CELL', technique)
          )
      }
    ];
    expect(serialize({ AIRWAY: SAP.AIRWAY }, serializers)).toStrictEqual({ airway: ETQ.airway });
  });
  it('serialize Respiration', () => {
    const serializers: SerializerInfo<ISAPPatientIQ, IPatientIQ>[] = [
      {
        from: 'RESPIRATION',
        to: 'respiration',
        serializers: [
          { from: 'CODE', to: 'id' },
          { from: 'DESCRIPTION', to: 'description' },
          {
            from: 'CELL',
            to: 'items',
            serializers: [
              { from: 'TIMESTAMP', to: 'timestamp' },
              { from: 'COMMENT', to: 'comment' },
              { from: 'OWNER', to: 'owner', serializers: ownerSerializers },
              { from: 'VALUE', to: 'value' },
              { from: 'UNIT', to: 'unit' },
              { from: 'ABNORMALITY', to: 'abnormality' }
            ]
          }
        ]
      }
    ];
    expect(serialize({ RESPIRATION: SAP.RESPIRATION }, serializers)).toStrictEqual({ respiration: ETQ.respiration });
  });
  it('serialize ArterialPathways', () => {
    const serializers: SerializerInfo<ISAPPatientIQ, IPatientIQ>[] = [
      {
        from: 'ARTERIALPATHWAYS',
        to: 'arterialPathways',
        serializers: [
          { from: 'CODE', to: 'id' },
          { from: 'DESCRIPTION', to: 'description' },
          {
            from: 'CELL',
            to: 'items',
            serializers: [
              { from: 'COMMENT', to: 'comment' },
              { from: 'OWNER', to: 'owner', serializers: ownerSerializers },
              { from: 'VALUE', to: 'value' },
              { from: 'INIT', to: 'init' },
              { from: 'END', to: 'end' }
            ]
          }
        ]
      }
    ];
    expect(serialize({ ARTERIALPATHWAYS: SAP.ARTERIALPATHWAYS }, serializers)).toStrictEqual({
      arterialPathways: ETQ.arterialPathways
    });
  });
});
