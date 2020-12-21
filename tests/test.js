const assert = require('assert');
const mapFunc = require('./methods');
it.optional = require('./it-optional');


describe('covidFunction', () => {
  it.optional('getColorMarker should return color for value', () => {
    assert.equal(mapFunc.getColorMarker('Confirmed'), '#33953D');
    assert.equal(mapFunc.getColorMarker('Deaths'), '#cd1b1b');
    assert.equal(mapFunc.getColorMarker('Recovered'), '#598bc1');
    assert.equal(mapFunc.getColorMarker(), null);
    assert.equal(mapFunc.getColorMarker('Recover'), null);
    assert.equal(mapFunc.getColorMarker(12), null);
  });

  it.optional('correctionOfCoords should return array with depth is 4', () => {
    assert.equal((mapFunc.correctionOfCoords([[[1,2,3]]])).toString(), ([[[[1,2,3]]]]).toString());
    assert.equal((mapFunc.correctionOfCoords([[[[1,2,3]]]])).toString(), ([[[[1,2,3]]]]).toString());
    assert.equal(mapFunc.correctionOfCoords(), null);
    assert.equal(mapFunc.correctionOfCoords('1,2,3'), null);
    assert.equal(mapFunc.correctionOfCoords(123), null);
  });
});
