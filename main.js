'use strict';

global.process = { env: {} };
global.Buffer = require('buffer').Buffer;
const util = require('util');

const defaultValue = `
await mongoose.connect('mongodb://localhost:27017/mongoose_test');
const schema = new mongoose.Schema({ name: String });
const TestModel = mongoose.model('Test', schema);

const doc = new TestModel({ name: 'foobar' });
console.log('Saving');
await doc.save();
console.log('Saved');

const docs = await TestModel.find();
console.log('Result', docs.map(doc => doc.toObject()));
`.trim();

const initialValue = window.location.hash ?
  atob(window.location.hash.slice(1)) :
  defaultValue;

const input = CodeMirror(document.querySelector('#input'), {
  mode: 'javascript',
  lineNumbers: true,
  value: initialValue
});

input.setOption('extraKeys', {
  'Shift-Enter': function() {
    run();
  }
});

const output = CodeMirror(document.querySelector('#output'), {
  mode: 'javascript',
  lineNumbers: true,
  value: ''
});

window.input = input;
window.output = output;

require('mongoose/lib/driver').set(
  require('@mongoosejs/in-memory-driver')
);

const _mongoose = require('mongoose/lib/mongoose');
window._mongoose = _mongoose;

console.log('Mongoose version', _mongoose.version);

const originalLog = console.log;
// https://glebbahmutov.com/blog/capture-all-the-logs/
// https://www.bayanbennett.com/posts/how-does-mdn-intercept-console-log-devlog-003/
console.log = function() {
  // messages.push(JSON.stringify(arguments[0])); // toString() causes [Object object]. No string conversion causes an error
  const messages = [];
  for (let i = 0; i < arguments.length; i++){
    const text = util.inspect(arguments[i]);
    messages.push(text);
  }
  const form = messages.join(" ");
  const currentValue = output.getValue();
  output.setValue((currentValue ? currentValue + '\n' : '') + form);
  originalLog.apply(console, arguments);
};

const originalError = console.error;
// https://glebbahmutov.com/blog/capture-all-the-logs/
// https://www.bayanbennett.com/posts/how-does-mdn-intercept-console-log-devlog-003/
console.log = function() {
  // messages.push(JSON.stringify(arguments[0])); // toString() causes [Object object]. No string conversion causes an error
  const messages = [];
  for (let i = 0; i < arguments.length; i++){
    const text = util.inspect(arguments[i]);
    messages.push(text);
  }
  const form = messages.join(" ");
  const currentValue = output.getValue();
  output.setValue((currentValue ? currentValue + '\n' : '') + form);
  originalError.apply(console, arguments);
};

document.querySelector('#run-button').addEventListener('click', () => {
  setTimeout(() => main(), 0);
});

const copyLinkButton = document.querySelector('#copy-link-button');
copyLinkButton.addEventListener('click', () => {
  tourl();
  copyUrl();
  copyLinkButton.textContent = 'Copied!';
  setTimeout(() => copyLinkButton.textContent = 'Copy Link', 5000);
});

setTimeout(() => main(), 0);

function copyUrl() {
  // get the container
  const body = document.querySelector('body');
  // Create a fake `textarea` and set the contents to the text
  // you want to copy
  const storage = document.createElement('textarea');
  storage.value = window.location.href;
  body.appendChild(storage);

  // Copy the text in the fake `textarea` and remove the `textarea`
  storage.select();
  storage.setSelectionRange(0, 99999);
  document.execCommand('copy');
  body.removeChild(storage);
}

function tourl() {
  window.location.hash = btoa(input.getValue());
}