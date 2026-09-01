import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

try {
  const streamWeb = require('stream/web');
  if (streamWeb) {
    if (!global.ReadableStream) global.ReadableStream = streamWeb.ReadableStream;
    if (!global.WritableStream) global.WritableStream = streamWeb.WritableStream;
    if (!global.TransformStream) global.TransformStream = streamWeb.TransformStream;
  }
} catch (e) {}


// Polyfill window.matchMedia
if (typeof window !== 'undefined') {
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: function () {},
      removeListener: function () {},
    };
  };
}

