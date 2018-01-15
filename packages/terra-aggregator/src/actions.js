import {
  OPEN,
  CLOSE,
} from './actionTypes';

export function open(data) {
  return { type: OPEN, data };
}

export function close(data) {
  return { type: CLOSE, data };
}
