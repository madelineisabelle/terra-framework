import { connect } from 'react-redux';

import Aggregator from './Aggregator';

import aggregatorReducers from './reducers';
import { openDisclosure, closeDisclosure, reset, setFocus } from './actions';

const mapStateToProps = state => (
  (disclosureState => ({
    disclosureComponentData: disclosureState.disclosureComponentData,
    disclosureSize: disclosureState.disclosureSize,
    disclosureIsOpen: disclosureState.disclosureIsOpen,
    focusItemId: disclosureState.focusItemId,
    focusItemState: disclosureState.focusItemState,
  }))(state.aggregator)
);

export { mapStateToProps };

const mapDispatchToProps = dispatch => ({
  openPanel: (data) => { dispatch(openDisclosure(data)); },
  closePanel: (data) => { dispatch(closeDisclosure(data)); },
  reset: () => { dispatch(reset()); },
  setFocus: (id, data) => { dispatch(setFocus(id, data)); },
});

export { mapDispatchToProps };

export default connect(mapStateToProps, mapDispatchToProps)(Aggregator);

const reducers = {
  aggregator: aggregatorReducers,
};
export { reducers };
