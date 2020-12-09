// Dom elements
const body = document.querySelector('body');
const textarea = document.querySelector(".textarea");
const keyboard = document.createElement("div");
const keyboardContainer = document.createElement("div");
const closeKeyboard = document.createElement("div");
const muteButton = document.createElement("div");

keyboardContainer.className = 'keyboardContainer keyboardContainerHidden';
closeKeyboard.className = 'closeKeyboard';
closeKeyboard.innerHTML = '<div>&#62&#62&#62</div>';

keyboard.id = 'keyboard';
keyboard.className = 'keyboard';
/*
muteButton.className = 'muteButton';
muteButton.innerHTML =
    `<div class="keyContent">
    <div class="keyFront"><img src="assets/icons/sound.png"></div>
    <div class="keyBack"><img src="assets/icons/mute.png"></div>
</div>`;

muteButton.addEventListener('click', () => {
    isMute = !isMute;
    if (isMute) {
        muteButton.classList.add('turned');
    } else {
        muteButton.classList.remove('turned');
    }
});*/

keyboardContainer.append(closeKeyboard);
keyboardContainer.append(keyboard);
//body.append(textarea);
body.append(keyboardContainer);
body.append(muteButton);

let lang = localStorage.getItem('keyboardVirtualLang') == undefined ? 'ru' : localStorage.getItem('keyboardVirtualLang');
let shift = false;
let ctrl = false;
let caps = false;
let startSelection = '';
let shiftPress = false;
let altPress = false;
let controlPress = false;
let capsLockPress = false;
let charInString = 87;
let isMute = false;

class Recorder {
  constructor() {
    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.rec = new SpeechRecognition();
    this.rec.interimResults = true;
    this.text = '';
    this.rec.addEventListener("result", function(e) {
      this.text = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
    });
    this.rec.addEventListener("end", function(e) {
      if (voiceRecordBtn.classList.length == 2) {
        let start = textarea.selectionStart;
        let end = textarea.selectionEnd - textarea.selectionStart;
        let textareaText = textarea.value.split('');
        textareaText.splice(start, end, this.text);
        textareaText = textareaText.join('') + ' ';
        textarea.value = textareaText;
        textarea.selectionStart = start + textareaText.length;
        textarea.selectionEnd = textarea.selectionStart;
        this.start();
      }
    });
  }
  recordStart() { this.rec.start(); }
  recordEnd() { this.rec.abort(); }
  changeLang() { this.rec.lang = lang == 'ru' ? 'ru' : 'en-US' }
}

function Key(code, isWrite, ru, ruShift, en, enShift, className) {
  this.code = code;
  this.isWrite = isWrite;
  this.ru = ru;
  this.ruShift = ruShift;
  this.en = en;
  this.enShift = enShift;
  this.className = className;
}

const keysArray = [
  new Key('Backquote', true, 'ё', 'Ё', '`', '~'),
  new Key('Digit1', true, '1', '!', '1', '!'),
  new Key('Digit2', true, '2', '"', '2', '@'),
  new Key('Digit3', true, '3', '№', '3', '#'),
  new Key('Digit4', true, '4', ';', '4', '$'),
  new Key('Digit5', true, '5', '%', '5', '%'),
  new Key('Digit6', true, '6', ':', '6', '^'),
  new Key('Digit7', true, '7', '?', '7', '&'),
  new Key('Digit8', true, '8', '*', '8', '*'),
  new Key('Digit9', true, '9', '(', '9', '('),
  new Key('Digit0', true, '0', ')', '0', ')'),
  new Key('Minus', true, '-', '_', '-', '_'),
  new Key('Equal', true, '=', '+', '=', '+'),
  new Key('Backspace', false, 'Backspace', '', '', '', 'backspace'),

  new Key('Tab', false, 'Tab', '', '', '', 'tab'),
  new Key('KeyQ', true, 'й', 'Й', 'q', 'Q'),
  new Key('KeyW', true, 'ц', 'Ц', 'w', 'W'),
  new Key('KeyE', true, 'у', 'У', 'e', 'E'),
  new Key('KeyR', true, 'к', 'К', 'r', 'R'),
  new Key('KeyT', true, 'е', 'Е', 't', 'T'),
  new Key('KeyY', true, 'н', 'Н', 'y', 'Y'),
  new Key('KeyU', true, 'г', 'Г', 'u', 'U'),
  new Key('KeyI', true, 'ш', 'Ш', 'i', 'I'),
  new Key('KeyO', true, 'щ', 'Щ', 'o', 'O'),
  new Key('KeyP', true, 'з', 'З', 'p', 'P'),
  new Key('BracketLeft', true, 'х', 'Х', '[', '{'),
  new Key('BracketRight', true, 'ъ', 'Ъ', ']', '}'),
  new Key('Enter', false, 'Enter', '', '', '', 'enter'),

  new Key('CapsLock', false, 'Caps Lock', '', '', '', 'capsLock'),
  new Key('KeyA', true, 'ф', 'Ф', 'a', 'A'),
  new Key('KeyS', true, 'ы', 'Ы', 's', 'S'),
  new Key('KeyD', true, 'в', 'В', 'd', 'D'),
  new Key('KeyF', true, 'а', 'А', 'f', 'F'),
  new Key('KeyG', true, 'п', 'П', 'g', 'G'),
  new Key('KeyH', true, 'р', 'Р', 'h', 'H'),
  new Key('KeyJ', true, 'о', 'О', 'j', 'J'),
  new Key('KeyK', true, 'л', 'Л', 'k', 'K'),
  new Key('KeyL', true, 'д', 'Д', 'l', 'L'),
  new Key('Semicolon', true, 'ж', 'Ж', ';', ':'),
  new Key('Quote', true, 'э', 'Э', '\'', '"'),
  new Key('Backslash', true, '\\', '/', '\\', '|'),
  new Key('Delete', false, 'DEL', '', '', '', 'delete'),

  new Key('ShiftLeft', false, 'Shift', '', '', '', 'shift'),
  new Key('KeyZ', true, 'я', 'Я', 'z', 'Z'),
  new Key('KeyX', true, 'ч', 'Ч', 'x', 'X'),
  new Key('KeyC', true, 'с', 'С', 'c', 'C'),
  new Key('KeyV', true, 'м', 'М', 'v', 'V'),
  new Key('KeyB', true, 'и', 'И', 'b', 'B'),
  new Key('KeyN', true, 'т', 'Т', 'n', 'N'),
  new Key('KeyM', true, 'ь', 'Ь', 'm', 'M'),
  new Key('Comma', true, 'б', 'Б', ',', '<'),
  new Key('Period', true, 'ю', 'Ю', '.', '>'),
  new Key('Slash', true, '.', ',', '/', '?'),
  new Key('ArrowUp', false, '', '', '', '', 'arrow'),
  new Key('ShiftRight', false, 'Shift', '', '', '', 'shift'),

  new Key('ControlLeft', false, 'Ctrl', '', '', '', 'ctrl'),
  new Key('langBtn', false, 'ру', 'ру', 'en', 'en', 'langBtn'),
  new Key('Space', true, ``, ' ', ``, ' ', 'space'),
  new Key('ArrowLeft', false, '', '', '', '', 'arrow'),
  new Key('ArrowDown', false, '', '', '', '', 'arrow'),
  new Key('ArrowRight', false, '', '', '', '', 'arrow'),
  new Key('voiceRecordBtn', false, '', '', '', '', 'voiceRecord')
];


function createKeyboard() {
  let keyboardContent = '';
  for (let i = 0; i < keysArray.length; i++) {
    let key = keysArray[i];
    let className = key.className == undefined ? 'key' : key.className;
    let keyText = '';
    if (key.isWrite || key.code == 'langBtn') {
      keyText = shift ? lang == 'ru' ? key.ruShift : key.enShift : lang == 'ru' ? key.ru : key.en;
      keyText =
        `<div class="${className}" id="${key.code}">
                    <div class="keyContent">
                        <div class='keyFront'>${key.ru}</div>
                        <div class='keyBack'>${key.en}</div>
                    </div>
                </div>`
    } else {
      keyText = `<div class ="${className}" id="${key.code}"> ${key.ru}</div>`
    }
    keyboardContent += keyText;
  }
  keyboard.innerHTML = keyboardContent;
}

function refreshKeyBoard(isLangCahge) {
  let refresh = function(from, to) {
    let i = from;
    setInterval(() => {
      if (i > to) {
        return;
      }
      let key = keysArray[i];
      let keyText = '';
      let keyDom = document.getElementById(key.code);
      if (key.isWrite || key.code == 'langBtn') {
        keyText = shift ? lang == 'ru' ? key.ruShift : key.enShift : lang == 'ru' ? key.ru : key.en;
        if (key.code != 'langBtn') {
          keyText = caps && shift ? keyText.toLowerCase() : caps || shift ? keyText.toUpperCase() : keyText;
        }
        if (keyDom.classList.length > 1 && keyDom.classList[1] == 'turned') {
          keyDom.querySelector('.keyFront').innerText = keyText;
          keyDom.classList.remove('turned');
        } else {
          keyDom.querySelector('.keyBack').innerText = keyText;
          keyDom.classList.add('turned');
        }
      }
      i++;
    }, 50);
  }
  if (isLangCahge) {
    setTimeout(refresh(56, 56), 10);
  }

  setTimeout(refresh(0, 13), 100);
  setTimeout(refresh(14, 27), 200);
  setTimeout(refresh(28, 41), 300);
  setTimeout(refresh(42, 55), 400);
}

function write(code) {
  let key = null;
  for (let i = 0; i < keysArray.length; i++) {
    if (keysArray[i].code == code) {
      key = keysArray[i];
    }
  }
  if (key != null) {
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd - textarea.selectionStart;
    let text = textarea.value.split('');
    let char = shift == true ? lang == 'ru' ? key.ruShift : key.enShift : lang == 'ru' ? key.ru : key.en;
    char = caps ? char.toUpperCase() : char;
    text.splice(start, end, char);
    text = text.join('');

    textarea.value = text;
    textarea.selectionStart = start + 1;
    textarea.selectionEnd = textarea.selectionStart;
  }
}

document.getElementById('keyboard').addEventListener('mousedown', function(event) {
  textarea.focus();
  let target = event.target;
  if (target.id != 'keyboard') {
    while (target.id == '') {
      target = target.parentElement;
    }
    choiceEvent(target.id);
    press(true, target, true);

    searchCountry(document.querySelector('.textarea').value);
    document.onmouseup = function() {
      textarea.focus();
      press(false, target, true);
    }
  }
});


document.addEventListener('keydown', function(event) {
  textarea.focus();
  let key = document.getElementById(event.code);
  if (key != null) {
    if (event.code == 'ShiftLeft' || event.code == 'ShiftRight') {
      if (!shiftPress) {
        press(true, key);
        shiftPress = true;
        shiftChange(true);
      }
    } else if (event.code == 'ControlLeft' || event.code == 'ControlRight') {
      if (!controlPress) {
        press(true, key);
        controlPress = true;
        controlChange(true);
      }
    } else if (event.code == 'CapsLock') {
      if (!capsLockPress) {
        press(true, key);
        capsLockPress = true;
        choiceEvent(event.code);
      }
    } else {
      press(true, key);
    }

    document.addEventListener('keyup', function(event) {
      let key = document.getElementById(event.code);
      if (key != null) {
        if (event.code == 'ShiftLeft' || event.code == 'ShiftRight') {
          shiftPress = false;
          shiftChange(false);
        } else if (event.code == 'ControlLeft' || event.code == 'ControlRight') {
          controlPress = false;
          controlChange(false);
        } else if (event.code == 'CapsLock') {
          capsLockPress = false;
        }
        press(false, key);
      }
    });
  }
});

function press(onOff, key, needSound) {
  if (onOff) { key.classList.add('press'); } else { key.classList.remove('press'); }
  if (needSound && !isMute) {
    let voice = '';
    if (key.classList[0] == 'key' || key.classList[0] == 'arrow' || key.classList[0] == 'voiceRecord' ||
      key.classList[0] == 'delete' || key.classList[0] == 'tab' || key.classList[0] == 'space') {
      voice = document.getElementById(`${lang}${onOff ? 'Down' : 'Up'}Audio`);
      voice.currentTime = 0;
      voice.play();
    } else if (onOff) {
      if (key.classList[0] == 'enter') {
        voice = document.getElementById('enterAudio');
      } else if (key.classList[0] == 'backspace') {
        voice = document.getElementById('backspaceAudio');
      } else if (key.classList[0] == 'shift') {
        voice = document.getElementById('shiftAudio');
      } else if (key.classList[0] == 'capsLock') {
        voice = document.getElementById('capsLookAudio');
      } else if (key.classList[0] == 'ctrl') {
        voice = document.getElementById(lang + 'Down' + 'Audio');
      } else if (key.classList[0] == 'langBtn') {
        voice = document.getElementById('langAudio');
      } else {
        return;
      }
      voice.currentTime = 0;
      voice.play();
    }


  }

}
/*
textarea.addEventListener('click', () => {
  if (keyboardContainer.classList.length == 2) {
    keyboardContainer.classList.remove('keyboardContainerHidden');
    if (!isMute) {
      let voice = document.getElementById('openKeyboardAudio');
      voice.currentTime = 0;
      voice.play();
    }
  }
});*/

closeKeyboard.addEventListener('click', () => {
  if (keyboardContainer.classList.length == 1) {
    keyboardContainer.classList.add('keyboardContainerHidden');
    if (!isMute) {
      let voice = document.getElementById('closeKeyboardAudio');
      voice.currentTime = 0;
      voice.play();
    }
  }
});


createKeyboard();
textarea.focus();


const recorder = new Recorder();
const voiceRecordBtn = document.getElementById('voiceRecordBtn');
voiceRecordBtn.innerHTML = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="475.085px" height="475.085px" viewBox="0 0 475.085 475.085" style="enable-background:new 0 0 475.085 475.085;"
xml:space="preserve">
<g>
<g>
   <path d="M237.541,328.897c25.128,0,46.632-8.946,64.523-26.83c17.888-17.884,26.833-39.399,26.833-64.525V91.365
       c0-25.126-8.938-46.632-26.833-64.525C284.173,8.951,262.669,0,237.541,0c-25.125,0-46.632,8.951-64.524,26.84
       c-17.893,17.89-26.838,39.399-26.838,64.525v146.177c0,25.125,8.949,46.641,26.838,64.525
       C190.906,319.951,212.416,328.897,237.541,328.897z"/>
   <path d="M396.563,188.15c-3.606-3.617-7.898-5.426-12.847-5.426c-4.944,0-9.226,1.809-12.847,5.426
       c-3.613,3.616-5.421,7.898-5.421,12.845v36.547c0,35.214-12.518,65.333-37.548,90.362c-25.022,25.03-55.145,37.545-90.36,37.545
       c-35.214,0-65.334-12.515-90.365-37.545c-25.028-25.022-37.541-55.147-37.541-90.362v-36.547c0-4.947-1.809-9.229-5.424-12.845
       c-3.617-3.617-7.895-5.426-12.847-5.426c-4.952,0-9.235,1.809-12.85,5.426c-3.618,3.616-5.426,7.898-5.426,12.845v36.547
       c0,42.065,14.04,78.659,42.112,109.776c28.073,31.118,62.762,48.961,104.068,53.526v37.691h-73.089
       c-4.949,0-9.231,1.811-12.847,5.428c-3.617,3.614-5.426,7.898-5.426,12.847c0,4.941,1.809,9.233,5.426,12.847
       c3.616,3.614,7.898,5.428,12.847,5.428h182.719c4.948,0,9.236-1.813,12.847-5.428c3.621-3.613,5.431-7.905,5.431-12.847
       c0-4.948-1.81-9.232-5.431-12.847c-3.61-3.617-7.898-5.428-12.847-5.428h-73.08v-37.691
       c41.299-4.565,75.985-22.408,104.061-53.526c28.076-31.117,42.12-67.711,42.12-109.776v-36.547
       C401.998,196.049,400.185,191.77,396.563,188.15z"/>
</g>
</g>
<g>
</g>
</svg>`;

let arrow = `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
width="46.02px" height="46.02px" viewBox="0 0 46.02 46.02" style="enable-background:new 0 0 46.02 46.02;" xml:space="preserve"
>
<g>
<g>
   <path d="M14.757,46.02c-1.412,0-2.825-0.521-3.929-1.569c-2.282-2.17-2.373-5.78-0.204-8.063l12.758-13.418L10.637,9.645
       C8.46,7.37,8.54,3.76,10.816,1.582c2.277-2.178,5.886-2.097,8.063,0.179l16.505,17.253c2.104,2.2,2.108,5.665,0.013,7.872
       L18.893,44.247C17.77,45.424,16.267,46.02,14.757,46.02z"/>
</g>
</g></svg>`

document.getElementById('ArrowRight').innerHTML = `${arrow}`;
document.getElementById('ArrowDown').innerHTML = `${arrow}`;
document.getElementById('ArrowLeft').innerHTML = `${arrow}`;
document.getElementById('ArrowUp').innerHTML = `${arrow}`;

voiceRecordBtn.addEventListener('click', () => {
  if (voiceRecordBtn.classList.length == 1) {
    voiceRecordBtn.classList.add('selected');
  } else {
    voiceRecordBtn.classList.remove('selected');
    recorder.recordEnd();
  }
  if (voiceRecordBtn.classList.length == 2) {
    recorder.recordStart();
  }
});