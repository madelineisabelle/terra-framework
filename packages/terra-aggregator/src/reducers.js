import {
  OPEN_DISCLOSURE,
  CLOSE_DISCLOSURE,
  RESET,
  SET_FOCUS,
} from './actionTypes';

const supportedSizes = {
  small: 'small',
  large: 'large',
};

const defaultAggregatorState = {
  disclosureSize: supportedSizes.small,
  disclosureIsOpen: false,
  focusItemId: undefined,
  focusItemData: undefined,
};

const aggregator = (state = defaultAggregatorState, action) => {
  const newState = Object.assign({}, state);

  switch (action.type) {
    case OPEN_DISCLOSURE:
      newState.disclosureIsOpen = true;
      newState.disclosureSize = 'small';
      newState.disclosureComponentData = action.data;

      return newState;
    case CLOSE_DISCLOSURE:
      return defaultAggregatorState;
    case RESET:
      return defaultAggregatorState;
    case SET_FOCUS:
      return {
        disclosureIsOpen: false,
        disclosureComponentData: undefined,
        focusItemId: action.id,
        focusItemState: action.data,
      };
    default:
      return state;
  }
};

export default aggregator;
