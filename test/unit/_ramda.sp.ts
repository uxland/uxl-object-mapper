// import * as R from 'ramda';

// describe('Ramda performance testing', () => {
//   it('Given an array, compare R.reduce performance with concat, spread or push', () => {
//     const nIterations = 5;
//     const results = {};
//     for (let i = 1; i < nIterations; i++) {
//       const a = new Array(10 ** i);
//       const t1 = performance.now();
//       R.reduce((collection, item) => collection.concat(item), [], a);
//       const t2 = performance.now();
//       R.reduce(
//         (collection, item) => {
//           collection.push(item);
//           return collection;
//         },
//         [],
//         a
//       );
//       const t3 = performance.now();
//       R.reduce((collection, item) => [...collection, item], [], a);
//       const t4 = performance.now();
//       results[`${10 ** i} - concat`] = t2 - t1;
//       results[`${10 ** i} - push`] = t3 - t2;
//       results[`${10 ** i} - spread`] = t4 - t3;
//     }
//     console.log('#### concat vs spread vs push ####');
//     console.table(results);
//     expect(true).toBeTruthy();
//   });

//   it('Given an array, compare R.reduce performance with js-reduce', () => {
//     const nIterations = 7;
//     const results = {};
//     for (let i = 1; i < nIterations; i++) {
//       const a = new Array(10 ** i);
//       const t1 = performance.now();
//       R.reduce(
//         (collection, item) => {
//           collection.push(item);
//           return collection;
//         },
//         [],
//         a
//       );
//       const t2 = performance.now();
//       a.reduce((collection, item) => {
//         collection.push(item);
//         return collection;
//       }, []);
//       const t3 = performance.now();
//       results[`${10 ** i} - ramda`] = t2 - t1;
//       results[`${10 ** i} - js`] = t3 - t2;
//     }
//     console.log('#### R.reduce vs JS Reduce ####');
//     console.table(results);
//     expect(true).toBeTruthy();
//   });
// });
