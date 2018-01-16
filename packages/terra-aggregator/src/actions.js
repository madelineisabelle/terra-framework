import {
  OPEN_DISCLOSURE,
  CLEAR_FOCUS,
  SET_FOCUS,
} from './actionTypes';

export function openDisclosure(data) {
  return { type: OPEN_DISCLOSURE, data };
}

export function clearFocus() {
  return { type: CLEAR_FOCUS };
}

export function setFocus(id, data) {
  return { type: SET_FOCUS, id, data };
}
