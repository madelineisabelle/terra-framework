import { open, push, pop, defaultState } from 'terra-modal-manager/lib/shared/disclosureReducerUtils';

import {
  OPEN,
  PUSH,
  POP,
  SET_FOCUS,
  CLEAR_FOCUS,
} from './actionTypes';

const supportedSizes = {
  small: 'small',
  large: 'large',
};

const defaultAggregatorState = Object.assign({}, defaultState, {
  focusItemId: undefined,
  focusItemData: undefined,
});

const aggregator = (state = defaultAggregatorState, action) => {
  switch (action.type) {
    case OPEN:
      return Object.assign({}, open(state, action), {
        size: action.data.size || supportedSizes.small,
      });
    case PUSH:
      return push(state, action);
    case POP:
      return pop(state, action);
    case CLEAR_FOCUS:
      return defaultAggregatorState;
    case SET_FOCUS:
      // We clear any disclosure state when focus changes; a subsequent OPEN action is necessary to present a new disclosure.
      return Object.assign({}, defaultAggregatorState, {
        focusItemId: action.id,
        focusItemState: action.data,
      });
    default:
      return state;
  }
};

export default aggregator;
