import { Deserializer, JsonProperty, ObjectMapper } from 'json-object-mapper';

const generateInput = (items: number, depth: number = 1): any[] => {
  let data = [];
  for (let i = 0; i < items; i++) {
    let item = {
      pass: 'bar',
      MAP: 'bar',
      toUpper: 'bar',
      toDate: '2019-01-01 00:00:00'
    };
    if (depth > 0) item = { ...item, array: generateInput(items, 0) };
    data.push(item);
  }
  return data;
};

const generateOutput = (items: number, depth: number = 1): any[] => {
  let data = [];
  for (let i = 0; i < items; i++) {
    let item = {
      pass: 'bar',
      map: 'bar',
      toUpper: 'BAR',
      toDate: new Date('2019-01-01 00:00:00')
    };
    if (depth > 0) item = { ...item, array: generateOutput(items, 0) };
    data.push(item);
  }
  return data;
};

let serializers = [
  {
    from: 'pass',
    to: 'pass'
  },
  {
    from: 'MAP',
    to: 'map'
  },
  {
    from: 'toUpper',
    to: 'toUpper',
    serializerFn: value => value.toUpperCase()
  },
  {
    from: 'toDate',
    to: 'toDate',
    serializerFn: value => new Date(value)
  }
];

// const baseSerializers = serializers.slice(0);
// serializers.push({ from: 'array', to: 'array', serializers: baseSerializers });

class ToUpperSerializer implements Deserializer {
  deserialize(value: string): string {
    return value.toUpperCase();
  }
}

class ToDateSerializer implements Deserializer {
  deserialize(value: string): Date {
    return new Date(value);
  }
}

class ToArraySerializer implements Deserializer {
  deserialize(value: any[]): any[] {
    return ObjectMapper.deserializeArray(JsonSerializer, value);
  }
}

class JsonSerializer {
  @JsonProperty({ name: 'pass' })
  pass: string = null;
  @JsonProperty({ name: 'MAP' })
  map: string = null;
  @JsonProperty({ name: 'toUpper', deserializer: ToUpperSerializer })
  toUpper: string = null;
  @JsonProperty({ name: 'toDate', deserializer: ToDateSerializer })
  toDate: Date = null;
  // @JsonProperty({ name: 'array', type: Array, deserializer: ToArraySerializer })
  // array: any[];
}

export { generateInput as input, generateOutput as output, serializers, JsonSerializer };
