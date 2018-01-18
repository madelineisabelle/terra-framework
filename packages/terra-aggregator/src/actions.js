import {
  OPEN,
  PUSH,
  POP,
  CLEAR_FOCUS,
  SET_FOCUS,
} from './actionTypes';

export function openDisclosure(data) {
  return { type: OPEN, data };
}

export function pushDisclosure(data) {
  return { type: PUSH, data };
}

export function popDisclosure(data) {
  return { type: POP, data };
}

export function clearFocus() {
  return { type: CLEAR_FOCUS };
}

export function setFocus(id, data) {
  return { type: SET_FOCUS, id, data };
}
