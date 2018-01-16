import {
  OPEN_DISCLOSURE,
  CLOSE_DISCLOSURE,
  RESET,
  SET_FOCUS,
} from './actionTypes';

export function openDisclosure(data) {
  return { type: OPEN_DISCLOSURE, data };
}

export function closeDisclosure(data) {
  return { type: CLOSE_DISCLOSURE, data };
}

export function reset() {
  return { type: RESET };
}

export function setFocus(id, data) {
  return { type: SET_FOCUS, id, data };
}
