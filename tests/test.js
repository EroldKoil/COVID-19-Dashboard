const assert = require('assert');
const func = require('./methods');
it.optional = require('./it-optional');


describe('covidFunction', () => {
  it.optional('getColorMarker should return color for value', () => {
    assert.equal(func.getColorMarker('Confirmed'), '#33953D');
    assert.equal(func.getColorMarker('Deaths'), '#cd1b1b');
    assert.equal(func.getColorMarker('Recovered'), '#598bc1');
    assert.equal(func.getColorMarker(), null);
    assert.equal(func.getColorMarker('Recover'), null);
    assert.equal(func.getColorMarker(12), null);
  });

  it.optional('correctionOfCoords should return array with depth is 4', () => {
    assert.equal((func.correctionOfCoords([
      [
        [1, 2, 3]
      ]
    ])).toString(), ([
      [
        [
          [1, 2, 3]
        ]
      ]
    ]).toString());
    assert.equal((func.correctionOfCoords([
      [
        [
          [1, 2, 3]
        ]
      ]
    ])).toString(), ([
      [
        [
          [1, 2, 3]
        ]
      ]
    ]).toString());
    assert.equal(func.correctionOfCoords(), null);
    assert.equal(func.correctionOfCoords('1,2,3'), null);
    assert.equal(func.correctionOfCoords(123), null);
  });

  it.optional('getImportanceValue should return Importance Value', () => {
    let elementsArray = [
      { population: 100000, death: 20 },
      { population: 234567, death: 20 },
      { population: 579841, death: 20 },
      { population: 4809841, death: 200 }
    ];
    assert.equal(func.getImportanceValue(elementsArray[0], 'death', false), 20);
    assert.equal(func.getImportanceValue(elementsArray[1], 'death', false), 8);
    assert.equal(func.getImportanceValue(elementsArray[2], 'death', true), 20);
    assert.equal(func.getImportanceValue(elementsArray[3], 'death', false), 4);
  });

  it.optional('makeValuesShorter should return shorter number', () => {
    assert.equal(func.makeValuesShorter(null), 0);
    assert.equal(func.makeValuesShorter(undefined), '');
    assert.equal(func.makeValuesShorter(0.01234567), 0.01234567);
    assert.equal(func.makeValuesShorter(12345), '12 тыс.');
    assert.equal(func.makeValuesShorter(1000000), '1.0 млн.');
    assert.equal(func.makeValuesShorter(32000000), '32 млн.');
  });

  it.optional('makeValuesShorter should return shorter number', () => {
    assert.equal(func.getFixedValue(null), 0);
    assert.equal(func.getFixedValue(undefined), 0);
    assert.equal(func.getFixedValue(101), 101);
    assert.equal(func.getFixedValue(12345.1), 12345);
    assert.equal(func.getFixedValue(32.76), 32.8);
    assert.equal(func.getFixedValue(11.12345), 11.12);
    assert.equal(func.getFixedValue(1.12345), 1.123);
  });

});