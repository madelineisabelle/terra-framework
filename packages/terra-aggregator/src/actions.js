import {
  OPEN,
  PUSH,
  POP,
  CLEAR_FOCUS,
  SET_FOCUS,
} from './actionTypes';

export function openDisclosure(aggregatorInstanceKey, data) {
  return { type: OPEN, aggregatorInstanceKey, data };
}

export function pushDisclosure(aggregatorInstanceKey, data) {
  return { type: PUSH, aggregatorInstanceKey, data };
}

export function popDisclosure(aggregatorInstanceKey, data) {
  return { type: POP, aggregatorInstanceKey, data };
}

export function clearFocus(aggregatorInstanceKey) {
  return { type: CLEAR_FOCUS, aggregatorInstanceKey };
}

export function setFocus(aggregatorInstanceKey, id, data) {
  return { type: SET_FOCUS, aggregatorInstanceKey, id, data };
}
