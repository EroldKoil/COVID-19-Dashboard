function getColorMarker(typeData) {
  if (typeData !== undefined && typeof typeData === 'string') {
    if (typeData.includes('Confirmed')) {
      return '#33953D';
    }
    if (typeData.includes('Recovered')) {
      return '#598bc1';
    }
    if (typeData.includes('Deaths')) {
      return '#cd1b1b';
    }
  }
  return null;
}

function correctionOfCoords(array) {
  if (array && Array.isArray(array)) {
    let depthArray = value => {
      return Array.isArray(value) ?
        1 + Math.max(...value.map(depthArray)) :
        0;
    }
    return depthArray(array) === 3 ? [array] : array;
  }
  return null;
}

function getImportanceValue(element, param, absValue) {
  if (absValue) {
    return element[param];
  }
  return Math.floor(100000 / element.population * element[param]);
}

function makeValuesShorter(value = '') {
  if (value === undefined || typeof value !== 'number') {
    return 0;
  }
  let str = value.toString();
  let sliceStr = "";
  if (Math.floor(value) !== value) {
    sliceStr = str.slice(0, str.indexOf(".") + 1);
  } else {
    sliceStr = str;
  }
  if (sliceStr.length == 4) {
    return str.slice(0, 1) + "." + str.slice(1, 2) + " тыс.";
  }
  if (sliceStr.length == 5) {
    return str.slice(0, 2) + " тыс.";
  }
  if (sliceStr.length == 6) {
    return 0 + "." + str.slice(0, 1) + " млн.";
  }
  if (sliceStr.length == 7) {
    return str.slice(0, 1) + "." + str.slice(1, 2) + " млн.";
  }
  if (sliceStr.length >= 8) {
    return str.slice(0, str.length - 6) + " млн.";
  } else {
    return str;
  }
}

function getFixedValue(value) {
  if (value === undefined || typeof value !== 'number') {
    return 0;
  }
  if (value > 100) {
    return Math.round(value);
  } else if (value > 30) {
    return value.toFixed(1);
  } else if (value > 10) {
    return value.toFixed(2);
  } else {
    return value.toFixed(3);
  }
}

module.exports = {
  getColorMarker,
  correctionOfCoords,
  getImportanceValue,
  makeValuesShorter,
  getFixedValue
}