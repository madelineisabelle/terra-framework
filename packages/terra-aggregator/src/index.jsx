import { connect } from 'react-redux';

import BaseAggregator from './Aggregator';

import generateReducer from './reducers';
import { openDisclosure, pushDisclosure, popDisclosure, clearFocus, setFocus } from './actions';

const instanceGenerator = (instanceKey) => {
  const mapStateToProps = state => (
    (disclosureState => ({
      disclosureComponentData: disclosureState.componentKeys.map(key => (disclosureState.components[key])),
      disclosureSize: disclosureState.size,
      disclosureIsOpen: disclosureState.isOpen,
      focusItemId: disclosureState.focusItemId,
      focusItemState: disclosureState.focusItemState,
    }))(state[`aggregator-${instanceKey}`])
  );

  const mapDispatchToProps = dispatch => ({
    openDisclosure: (data) => { dispatch(openDisclosure(instanceKey, data)); },
    pushDisclosure: (data) => { dispatch(pushDisclosure(instanceKey, data)); },
    popDisclosure: (data) => { dispatch(popDisclosure(instanceKey, data)); },
    clearFocus: () => { dispatch(clearFocus(instanceKey)); },
    setFocus: (id, data) => { dispatch(setFocus(instanceKey, id, data)); },
  });

  return {
    Aggregator: connect(mapStateToProps, mapDispatchToProps)(BaseAggregator),
    reducer: {
      [`aggregator-${instanceKey}`]: generateReducer(instanceKey),
    },
  };
};

export { instanceGenerator };

const { Aggregator, reducer } = instanceGenerator('default');
export default Aggregator;
export { reducer as reducers };
