import { connect } from 'react-redux';

import Aggregator from './Aggregator';

import aggregatorReducers from './reducers';
import { openDisclosure, pushDisclosure, popDisclosure, clearFocus, setFocus } from './actions';

const mapStateToProps = state => (
  (disclosureState => ({
    disclosureComponentData: disclosureState.componentKeys.map(key => (disclosureState.components[key])),
    disclosureSize: disclosureState.size,
    disclosureIsOpen: disclosureState.isOpen,
    focusItemId: disclosureState.focusItemId,
    focusItemState: disclosureState.focusItemState,
  }))(state.aggregator)
);

export { mapStateToProps };

const mapDispatchToProps = dispatch => ({
  openDisclosure: (data) => { dispatch(openDisclosure(data)); },
  pushDisclosure: (data) => { dispatch(pushDisclosure(data)); },
  popDisclosure: (data) => { dispatch(popDisclosure(data)); },
  clearFocus: () => { dispatch(clearFocus()); },
  setFocus: (id, data) => { dispatch(setFocus(id, data)); },
});

export { mapDispatchToProps };

export default connect(mapStateToProps, mapDispatchToProps)(Aggregator);

const reducers = {
  aggregator: aggregatorReducers,
};
export { reducers };
