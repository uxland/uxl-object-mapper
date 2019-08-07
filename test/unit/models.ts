export interface IIQEventOwner {
  id: string;
  name: string;
  surname: string;
}

export const enum Abnormality {
  Low = 'L',
  Normal = 'N',
  High = 'H'
}

export interface IIQSingleEvent {
  id: string;
  value: string | number;
  date: Date;
  owner: IIQEventOwner;
  comment: string;
  unit?: string;
  abnormality?: Abnormality;
}

export interface IIQRangeEvent extends IIQSingleEvent {
  init: Date;
  end: Date;
}

export interface IIQEventGroup<T> {
  id: string;
  description: string;
  items: T[];
}

export interface IPatientIQ {
  events?: IIQSingleEvent[];
  techniques?: IIQSingleEvent[];
  parameters?: IIQEventGroup<IIQSingleEvent>[];
  analytics?: IIQEventGroup<IIQSingleEvent>[];
  airway?: IIQRangeEvent[];
  respiration?: IIQEventGroup<IIQSingleEvent>[];
  arterialPathways?: IIQEventGroup<IIQRangeEvent>[];
}

export interface ISAPIQOwner {
  ID: string;
  NAME: string;
  SURNAME: string;
}

export interface ISAPIQEvent {
  TIMESTAMP: string;
  COMMENT: string;
  OWNER: ISAPIQOwner;
  INIT: string;
  END: string;
  VALUE: string;
  UNIT: string;
  ABNORMALITY: string;
}

export interface ISAPIQEventGroup {
  CODE: string;
  DESCRIPTION: string;
  CELL: ISAPIQEvent[];
}

export interface ISAPPatientIQ {
  EVENTS?: Array<ISAPIQEventGroup>;
  TECHNIQUES?: Array<ISAPIQEventGroup>;
  PARAMETERS?: Array<ISAPIQEventGroup>;
  ANALYTIC?: Array<ISAPIQEventGroup>;
  AIRWAY?: Array<ISAPIQEventGroup>;
  ARTERIALPATHWAYS?: Array<ISAPIQEventGroup>;
  RESPIRATION?: Array<ISAPIQEventGroup>;
}
