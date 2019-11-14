import { ObjectMapper } from 'json-object-mapper';
import 'reflect-metadata';
import { serialize } from '../../src/serialize';
import { serialize as serializeSet } from '../../src/serialize-set';
import * as generators from './data/generators';

describe('Benchmarks', () => {
  it('Benchmark: object serialization uxl-object-mapper vs json-object-mapper', () => {
    /* PREVALIDATION */
    const input = generators.input(100, 0);
    const output = generators.output(100, 0);
    expect(serialize(input, generators.serializers)).toStrictEqual(output);
    expect(serializeSet(input, generators.serializers)).toStrictEqual(output);
    expect(ObjectMapper.deserializeArray(generators.JsonSerializer, input)).toEqual(output);

    /* BENCHMARK */
    const nItems = [1, 10, 100, 1000, 10000, 100000];
    const iterations = [1000, 100, 100, 10, 10, 1];
    const times = {
      uxl: {},
      set: {},
      json: {}
    };
    for (let i = 0; i < nItems.length; i++) {
      const items = nItems[i];
      for (let j = 0; j < iterations[i]; j++) {
        const input = generators.input(items, 0);
        const t1 = performance.now();
        serialize(input, generators.serializers);
        const t2 = performance.now();
        serializeSet(input, generators.serializers);
        const t3 = performance.now();
        ObjectMapper.deserializeArray(generators.JsonSerializer, input);
        const t4 = performance.now();
        if (!times.uxl[`${items} (${iterations[i]} runs)`]) times.uxl[`${items} (${iterations[i]} runs)`] = [];
        times.uxl[`${items} (${iterations[i]} runs)`].push(t2 - t1);
        if (!times.set[`${items} (${iterations[i]} runs)`]) times.set[`${items} (${iterations[i]} runs)`] = [];
        times.set[`${items} (${iterations[i]} runs)`].push(t3 - t2);
        if (!times.json[`${items} (${iterations[i]} runs)`]) times.json[`${items} (${iterations[i]} runs)`] = [];
        times.json[`${items} (${iterations[i]} runs)`].push(t4 - t3);
      }
    }

    const means = {
      uxl: Object.keys(times.uxl).reduce(
        (collection, key) => ({
          ...collection,
          [key]: times.uxl[key].reduce((acc, time) => (acc += time), 0) / parseInt(key.split('(')[1].split(' ')[0])
        }),
        {}
      ),
      set: Object.keys(times.set).reduce(
        (collection, key) => ({
          ...collection,
          [key]: times.set[key].reduce((acc, time) => (acc += time), 0) / parseInt(key.split('(')[1].split(' ')[0])
        }),
        {}
      ),
      json: Object.keys(times.json).reduce(
        (collection, key) => ({
          ...collection,
          [key]: times.json[key].reduce((acc, time) => (acc += time), 0) / parseInt(key.split('(')[1].split(' ')[0])
        }),
        {}
      )
    };
    console.table(means);
    // const fastest =
    //   means.uxl < means.set && means.uxl < means.json
    //     ? 'uxl'
    //     : means.set < means.uxl && means.set < means.json
    //     ? 'set'
    //     : 'json';
    // // const results = {
    // //   uxl: { meanTime: means.uxl, ratio: means.uxl / means[fastest] },
    // //   set: { meanTime: means.set, ratio: means.set / means[fastest] },
    // //   json: { meanTime: means.json, ratio: means.json / means[fastest] }
    // // };
    // console.table(results);
  });
});
