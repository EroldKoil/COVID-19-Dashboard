function getColorMarker(typeData) {
    if(typeData!== undefined && typeof typeData === 'string') {
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
    if(array && Array.isArray(array)) {
        let depthArray = value => {
            return Array.isArray(value) ?
                1 + Math.max(...value.map(depthArray)) :
                0;
        }
        return depthArray(array) === 3 ? [array] : array;
    }
    return null;
}

module.exports ={
    getColorMarker,
    correctionOfCoords
}