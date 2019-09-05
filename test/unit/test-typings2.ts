import { addDays } from 'date-fns';
import { AbapBoolean, SAPDateSerializer, serialize, SerializerInfo } from 'src';

export interface IAvailableHourDay {
  date: Date;
  morning: IPeriodDay;
  afternoon: IPeriodDay;
}
interface IPeriodDay {
  available: boolean;
  percentage: number;
  availableHours: { hour: string }[];
}
export interface ISAPAvailableHourDay {
  DATE: string;
  MORNING: ISAPPeriodDay;
  AFTERNOON: ISAPPeriodDay;
}
interface ISAPPeriodDay {
  AVAILABLE: AbapBoolean;
  PERCENTAGE: number;
  AVAILABLEHOURS: ISAPAvailableHour[];
}
interface ISAPAvailableHour {
  BEGTI: string;
  ENDTI: string;
}

const timeSerializer = (time: string): string => (time ? `${time.slice(0, 2)}:${time.slice(2, 4)}` : undefined);
const dateSerializer = (date: any): any => (date ? SAPDateSerializer(`${date} 000000`) : undefined);
const SAPBooleanCustomSerializer = (val: string): boolean => val === 'true';
const periodDaySerializers = [
  {
    from: 'AVAILABLE',
    to: 'available',
    serializerFn: SAPBooleanCustomSerializer
  },
  {
    from: 'PERCENTAGE',
    to: 'percentage'
  },
  {
    from: 'AVAILABLEHOURS',
    to: 'availableHours',
    serializers: [
      {
        from: 'BEGTI',
        to: 'hour',
        serializerFn: timeSerializer
      }
    ]
  }
];
const serializers: SerializerInfo<ISAPAvailableHourDay, IAvailableHourDay>[] = [
  {
    from: 'DATE',
    to: 'date',
    serializerFn: dateSerializer
  },
  {
    from: 'MORNING',
    to: 'morning',
    serializers: periodDaySerializers
  },
  {
    from: 'AFTERNOON',
    to: 'afternoon',
    serializers: periodDaySerializers
  }
];
export const availableHoursDayMapper = (data: ISAPAvailableHourDay[], initDate: Date): IAvailableHourDay[] => {
  const response = serialize<ISAPAvailableHourDay, IAvailableHourDay>(data, serializers);
  let mappedResponse = [];
  const week = weekFactory(initDate);
  Object.keys(week).forEach(k => {
    let foundItem = response.find(d => d.date.toISOString() === k);
    if (foundItem != undefined) {
      mappedResponse.push(foundItem);
    } else {
      mappedResponse.push({
        date: k,
        afternoon: {
          available: false
        },
        morning: {
          available: false
        }
      });
    }
  });
  return mappedResponse;
};
const physicianSerializers = [
  {
    from: 'ID',
    to: 'id'
  },
  {
    from: 'NAME',
    to: 'name'
  }
];
export const physiciansMapper = (data: ISAPTreatmentUnitPhysician[]): ITreatmentUnitPhysician[] =>
  serialize<ISAPTreatmentUnitPhysician, ITreatmentUnitPhysician>(data, physicianSerializers);
const weekFactory = (initDate: Date) => {
  return {
    [initDate.toISOString()]: {},
    [addDays(initDate, 1).toISOString()]: {},
    [addDays(initDate, 2).toISOString()]: {},
    [addDays(initDate, 3).toISOString()]: {},
    [addDays(initDate, 4).toISOString()]: {}
  };
};
