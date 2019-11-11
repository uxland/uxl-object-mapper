import { Deserializer, JsonProperty, ObjectMapper } from 'json-object-mapper';

export class OwnerInfo {
  @JsonProperty({ name: 'OWNERID' })
  ownerId: string = null;
  @JsonProperty({ name: 'OWNERNAME' })
  ownerName: string = null;
  @JsonProperty({ name: 'OWNERSURNAME' })
  ownerSurname: string = null;
  @JsonProperty({ name: 'OWNERSPECIALITY' })
  ownerSpeciality: string = null;
  @JsonProperty({ name: 'OWNERJOB' })
  ownerJob: string = null;
}
export class RelevantInfo {
  @JsonProperty({ name: 'OWNER' })
  owner: string = null;
  @JsonProperty({ name: 'SERVICE' })
  service: string = null;
  @JsonProperty({ name: 'DATE' })
  _date: string = null;
  @JsonProperty({ name: 'TIME' })
  _time: string = null;
  date: string = null;
}
export class OwnerInfoSerializer implements Deserializer {
  deserialize(value: string): OwnerInfo {
    return ObjectMapper.deserialize(OwnerInfo, value);
  }
}
export class RelevantPetitionSerializer implements Deserializer {
  deserialize(value: string): RelevantInfo {
    return ObjectMapper.deserialize(RelevantInfo, value);
  }
}

export class MedicalReport {
  @JsonProperty({ name: 'ID' })
  id: string = null;
  @JsonProperty({ name: 'DATE' })
  _date?: string = null;
  @JsonProperty({ name: 'TIME' })
  _time?: string = null;
  @JsonProperty({ name: 'DESCRIPTION' })
  description: string = null;
  @JsonProperty({ name: 'TYPE' })
  type: string = null;
  @JsonProperty({ name: 'STATUS' })
  status: any = null;
  @JsonProperty({ name: 'UNIT' })
  unit: string = null;
  @JsonProperty({ name: 'CASE' })
  case: string = null;
  @JsonProperty({ name: 'SERVICE' })
  service: string = null;
  @JsonProperty({ name: 'OWNER', deserializer: OwnerInfoSerializer })
  owner: any = null;
  @JsonProperty({ name: 'RELEVANT', deserializer: RelevantPetitionSerializer })
  relevant: any = null;
  @JsonProperty({ name: 'HAS_INTERNAL_PDF' /*, deserializer: BooleanSerializer*/ })
  hasInternalPdf: boolean = null;
  @JsonProperty({ name: 'URL' })
  url: string = null;
  @JsonProperty({ name: 'PDF' })
  pdf: string = null;
  dateTime?: string = null;
}
