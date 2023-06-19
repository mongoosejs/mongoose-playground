'use strict';

global.process = { env: {} };
global.Buffer = require('buffer').Buffer;
const util = require('util');

const initialValue = `
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

const input = CodeMirror(document.querySelector('#input'), {
  mode: 'javascript',
  lineNumbers: true,
  value: initialValue
});

const output = CodeMirror(document.querySelector('#output'), {
  mode: 'javascript',
  lineNumbers: true,
  value: 'Output here'
});

function tourl() {
  window.location.hash = btoa(input.getValue());
}

require('mongoose/lib/driver').set(
  require('@mongoosejs/in-memory-driver')
);

const mongoose = require('mongoose/lib/mongoose');

console.log('Mongoose version', mongoose.version);

let logMessages = [];
const originalMethod = console.log;
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
  logMessages.push(form);
  originalMethod.apply(console, arguments);
}

document.querySelector('#run-button').addEventListener('click', () => {
  run();
});

document.querySelector('#copy-link-button').addEventListener('click', () => {
  tourl();
  copyUrl();
});

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

async function run() {
  logMessages = [];
  const value = input.getValue();
  await eval(`(async function() { ${value} })()`);
  output.setValue(logMessages.join('\n'));
}