import { connect } from 'react-redux';

import Aggregator from './Aggregator';

import aggregatorReducers from './reducers';
import { open, close } from './actions';

const mapStateToProps = state => (
  (disclosureState => ({
    disclosureComponentData: disclosureState.disclosureComponentData,
    disclosureSize: disclosureState.disclosureSize,
    disclosureIsOpen: disclosureState.disclosureIsOpen,
  }))(state.aggregator)
);

export { mapStateToProps };

const mapDispatchToProps = dispatch => ({
  openPanel: (data) => { dispatch(open(data)); },
  closePanel: (data) => { dispatch(close(data)); },
});

export { mapDispatchToProps };

export default connect(mapStateToProps, mapDispatchToProps)(Aggregator);

const reducers = {
  aggregator: aggregatorReducers,
};
export { reducers };
