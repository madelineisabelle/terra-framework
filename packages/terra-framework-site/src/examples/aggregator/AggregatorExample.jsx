import React from 'react';
import PropTypes from 'prop-types';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import Aggregator, { reducers as aggregatorReducers } from 'terra-aggregator';
import ModalManager, { reducers as modalManagerReducers } from 'terra-modal-manager';

import Section, { reducers as sectionReducers } from './ExampleSection';

debugger;

const store = createStore(
  combineReducers(Object.assign({},
    aggregatorReducers,
    modalManagerReducers,
    sectionReducers,
  )),
);

const propTypes = {
  size: PropTypes.string,
};

class AggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const sections = [
      <Section key="1" name="1" sectionKey="1" />,
      <Section key="2" name="2" sectionKey="2" />,
      <Section key="3" name="3" sectionKey="3" />,
    ];

    const body = (
      <div>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Update</button>
        {
          <Provider store={store}>
            <ModalManager>
              <Aggregator>
                {this.state.flip ? sections.reverse() : sections }
              </Aggregator>
            </ModalManager>
          </Provider>
        }
      </div>
    );

    return body;
  }
}

AggregatorExample.propTypes = propTypes;

export default AggregatorExample;
