import * as R from 'ramda';
import { serialize, SerializerInfo } from 'src';

interface ISAPRelevantInfo {
  OWNER: string;
  SERVICE: string;
  DATE: string;
  TIME: string;
}
interface ISAPOwnerInfo {
  OWNERID: string;
  OWNERNAME: string;
  OWNERSURNAME: string;
  OWNERSPECIALITY: string;
  OWNERJOB: string;
}

interface ISAPClinicalCourse {
  ID: string;
  DATE?: string;
  TIME?: string;
  MODIFICATIONDATE: string;
  CONTENT: string;
  UNIT: string;
  SERVICE: string;
  CASE: string;
  INSTITUTION: string;
  VISITMOVEMENT: string;
  RELEVEVANT: ISAPRelevantInfo;
  OWNER: ISAPOwnerInfo;
  SUBJECTIVE: boolean;
}
interface IClinicalCourse {
  id: string;
  date?: Date;
  modificationDate: Date;
  content: string;
  unit: string;
  service: string;
  case: string;
  institution: string;
  visitMovement: string;
  relevant: IRelevantInfo;
  owner: IOwnerInfo;
  subjective: boolean;
}
interface IRelevantInfo {
  owner: string;
  service: string;
  date: string;
}
interface IOwnerInfo {
  ownerId: string;
  ownerName: string;
  ownerSurname: string;
  ownerSpeciality: string;
  ownerJob: string;
}

const dataSerializer: any[] = [
  {
    from: ['DATE', 'TIME'],
    to: 'date',
    serializerFn: (date: string, time: string): string => (date && time ? R.concat(date, time) : undefined)
  }
];

type ArrayDeserializer = SerializerInfo<ISAPClinicalCourse[], IClinicalCourse[]>;
type ObjectDeserializer = SerializerInfo<ISAPClinicalCourse, IClinicalCourse>;

const deserializer: Array<ArrayDeserializer | ObjectDeserializer> = [
  ...dataSerializer,
  { from: 'ID', to: 'id' },
  { from: 'MODIFICATIONDATE', to: 'modificationDate' },
  { from: 'CONTENT', to: 'content' },
  { from: 'UNIT', to: 'unit' },
  { from: 'SERVICE', to: 'service' },
  { from: 'CASE', to: 'case' },
  { from: 'INSTITUTION', to: 'institution' },
  { from: 'VISITMOVEMENT', to: 'visitMovement' },
  {
    from: 'RELEVEVANT',
    to: 'relevant',
    serializers: [{ from: 'OWNER', to: 'owner' }, { from: 'SERVICE', to: 'service' }, ...dataSerializer]
  },
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
  { from: 'SUBJECTIVE', to: 'subjective' }
];
const dataArray: ISAPClinicalCourse[] = [
  {
    ID: undefined,
    DATE: undefined,
    TIME: undefined,
    MODIFICATIONDATE: undefined,
    CONTENT: undefined,
    UNIT: undefined,
    SERVICE: undefined,
    CASE: undefined,
    INSTITUTION: undefined,
    VISITMOVEMENT: undefined,
    RELEVEVANT: undefined,
    OWNER: undefined,
    SUBJECTIVE: undefined
  }
];
const dataObject: ISAPClinicalCourse = {
  ID: undefined,
  DATE: undefined,
  TIME: undefined,
  MODIFICATIONDATE: undefined,
  CONTENT: undefined,
  UNIT: undefined,
  SERVICE: undefined,
  CASE: undefined,
  INSTITUTION: undefined,
  VISITMOVEMENT: undefined,
  RELEVEVANT: undefined,
  OWNER: undefined,
  SUBJECTIVE: undefined
};

export const clinicalCoursesMapperDeserializer = (data: ISAPClinicalCourse[]): IClinicalCourse[] =>
  serialize<ISAPClinicalCourse[], IClinicalCourse[]>(dataArray, deserializer as ArrayDeserializer[]);
export const clinicalCourseMapperDeserializer = (data: ISAPClinicalCourse): IClinicalCourse =>
  serialize<ISAPClinicalCourse, IClinicalCourse>(dataObject, deserializer as ObjectDeserializer[]);
