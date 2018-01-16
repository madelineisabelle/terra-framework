import {
  OPEN,
  CLOSE,
} from './actionTypes';

const supportedSizes = {
  small: 'small',
  large: 'large',
};

const defaultAggregatorState = {
  disclosureSize: supportedSizes.small,
  disclosureIsOpen: false,
};

const aggregator = (state = defaultAggregatorState, action) => {
  const newState = Object.assign({}, state);

  switch (action.type) {
    case OPEN:
      newState.disclosureIsOpen = true;
      newState.disclosureSize = 'small';
      newState.disclosureComponentData = action.data;

      return newState;
    case CLOSE:
      return defaultAggregatorState;
    default:
      return state;
  }
};

export default aggregator;
