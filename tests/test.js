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
    assert.equal(func.getImportanceValue(elementsArray[0], 'death'), 20);
    assert.equal(func.getImportanceValue(elementsArray[1], 'death'), 8);
    assert.equal(func.getImportanceValue(elementsArray[2], 'death'), 3);
    assert.equal(func.getImportanceValue(elementsArray[3], 'death'), 4);
  });
});