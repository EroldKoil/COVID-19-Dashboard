function choiceEvent(code) {
    switch (code) {
        case 'Tab':
            writeChar('\t');
            break;
        case 'CapsLock':
            capsLookChange();
            break;
        case 'ShiftLeft':
            shiftChange();
            break;
        case 'ShiftRight':
            shiftChange();
            break;
        case 'langBtn':
            changeLanguage();
            break;
        case 'Enter':
            writeChar('\n');
            break;
        case 'Backspace':
            deleteChar(-1);
            break;
        case 'Delete':
            deleteChar(0);
            break;
        case 'ControlLeft':
            controlChange();
            break;
        case 'ControlRight':
            controlChange();
            break;
        case 'voiceRecord':
            voiceRecord();
            break;
        case 'ArrowLeft':
            move('left');
            break;
        case 'ArrowUp':
            move('up');
            break;
        case 'ArrowRight':
            move('right');
            break;
        case 'ArrowDown':
            move('down');
            break;
        case 'Space':
            writeChar(' ');
            break;
        default:
            write(code);
    }
}

function capsLookChange() {
    caps = !caps;
    refreshKeyBoard();
    if (caps) {
        document.querySelector('.capsLock').classList.add('selected');
    } else {
        document.querySelector('.capsLock').classList.remove('selected');
    }
}

function shiftChange(value) {
    let newShiftValue = value == undefined ? shiftPress == false ? !shift : shift : value;
    if (shift != newShiftValue) {
        shift = newShiftValue;
        if (shift) {
            document.getElementById('ShiftLeft').classList.add('selected');
            document.getElementById('ShiftRight').classList.add('selected');
        } else {
            document.getElementById('ShiftLeft').classList.remove('selected');
            document.getElementById('ShiftRight').classList.remove('selected');
        }
        refreshKeyBoard();
    }
}

function writeChar(char) {
    let start = textarea.selectionStart;
    let text = textarea.value.split('');
    text.splice(start, 0, char);
    let value = '';
    for (let i = 0; i < text.length; i++) {
        value += text[i];
    }
    textarea.value = value;
    textarea.selectionStart = start + 1;
    textarea.selectionEnd = textarea.selectionStart;
}

function changeLanguage() {
    lang = lang == 'ru' ? 'en' : 'ru';
    localStorage.setItem('keyboardVirtualLang', lang);
    refreshKeyBoard(true);
    recorder.changeLang();
}

function deleteChar(count) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    let text = textarea.value.split('');
    if (start == end) {
        text.splice(start == 0 ? 0 : start + count, 1, '');
    } else {
        text.splice(start == 0 ? 0 : start + count, end - start, '');
    }
    let value = '';
    for (let i = 0; i < text.length; i++) {
        value += text[i];
    }
    textarea.value = value;
    textarea.selectionStart = start == end ? start + count : start;
    textarea.selectionEnd = textarea.selectionStart;
}

function controlChange(value) {
    let newControlValue = value == undefined ? controlPress == false ? !ctrl : ctrl : value;
    if (ctrl != newControlValue) {
        ctrl = newControlValue;
        if (ctrl) {
            document.getElementById('ControlLeft').classList.add('selected');
        } else {
            document.getElementById('ControlLeft').classList.remove('selected');
        }
    }
}

function move(side) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    if (end == start) {
        if (side == 'left' || side == 'up') {
            startSelection = 'start';
        } else {
            startSelection = 'end';
        }
    }

    switch (side) {
        case 'left':
            if (ctrl) {
                let number = startSelection == 'start' ? start : end;
                if (!(startSelection == 'start' && start == 0)) {
                    let text = textarea.value.split('');
                    text.splice(number - 1, textarea.value.length - number);
                    text = text.join('');
                    let match = text.match(/[^a-zA-ZА-Яа-я0-9]/g);
                    number = match == undefined ? 0 : text.lastIndexOf(match[match.length - 1]) + 1;
                }
                if (startSelection == 'start') {
                    start = number;
                } else {
                    end = number;
                }
            } else {
                startSelection == 'end' ? end-- : start--;
            }
            break;
        case 'right':
            if (ctrl) {
                let number = startSelection == 'start' ? start : end;
                if (!(startSelection == 'end' && end == textarea.value.length - 1)) {
                    let text = textarea.value.split('');
                    text.splice(0, number + 1);
                    text = text.join('');
                    let match = text.match(/[^a-zA-ZА-Яа-я0-9]/g);
                    number = match == undefined ? textarea.value.length : textarea.value.indexOf(match[0], number + 1);
                }
                if (startSelection == 'start') {
                    start = number;
                } else {
                    end = number;
                }
            } else {
                startSelection == 'start' ? start++ : end++;
            }
            break;
        case 'up':
            if (!(startSelection == 'start' && start == 0)) {
                let number = startSelection == 'start' ? start : end;
                let text = textarea.value.split('');
                text.splice(number, textarea.value.length - number);
                text = text.join('');
                let match = text.split(/\n/g);

                if (match.length == 1) {
                    number = number - charInString > 0 ? number - charInString : 0;
                } else if (match[match.length - 1].length > charInString) {
                    number -= charInString;
                } else {
                    number = -1;
                    for (let i = 0; i < match.length; i++) {
                        number += match[i].length + 1;
                    }
                    let countStringInLastMatch = Math.floor(match[match.length - 2].length / charInString);
                    let balance = match[match.length - 2].length - countStringInLastMatch * (charInString + 1);
                    if (balance < match[match.length - 1].length) {
                        number = number - match[match.length - 1].length - 1;
                    } else {
                        number -= balance + countStringInLastMatch + 1;
                    }
                }
                if (startSelection == 'start') {
                    start = number;
                } else {
                    end = number;
                }
            }
            break;
        case 'down':
            if (!(startSelection == 'end' && end == textarea.value.length)) {
                let number = startSelection == 'start' ? start : end;
                let text = textarea.value.split('');
                text.splice(0, number);
                text = text.join('');
                let match = text.split(/\n/g);

                let textBefore = textarea.value.split('');
                textBefore.splice(number, textarea.value.length - number);
                textBefore = textBefore.join('');
                let matchBefore = textBefore.split(/\n/g);
                let charsBefore = matchBefore[matchBefore.length - 1].length - Math.floor(matchBefore[matchBefore.length - 1].length / charInString) * (charInString);

                if (match.length == 1) {
                    number = number + charInString > textarea.value.length ? textarea.value.length : number + charInString;
                } else if (match[0].length >= 87) {
                    number += charInString;
                } else if (match[0].length + charsBefore > charInString) {
                    number += match[0].length;
                } else {
                    number += match[0].length + 1;
                    if (charsBefore > match[1].length) {
                        number += match[1].length;
                    } else {
                        number += charsBefore;
                    }
                }
                if (startSelection == 'start') {
                    start = number;
                } else {
                    end = number;
                }
            }
            break;
    }
    if (start < 0) {
        start = 0;
    } else if (end > textarea.value.length) {
        end = textarea.value.length;
    }
    if (!shift) {
        startSelection = '';
        if (side == 'left' || side == 'up') {
            end = start;
        } else {
            start = end;
        }
    }
    textarea.selectionStart = start;
    textarea.selectionEnd = end;
}