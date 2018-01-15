import React from 'react';
import PropTypes from 'prop-types';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies

import Aggregator, { reducers as aggregatorReducers } from 'terra-aggregator';
import Section from './ExampleSection';

const store = createStore(
  combineReducers(Object.assign({},
    aggregatorReducers,
  )),
);

const propTypes = {
  size: PropTypes.string,
};

const counter = 0;

class AggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      inc: 0,
    };
  }

  render() {
    const body = (
      <div>
        <button onClick={() => { this.setState({ inc: this.state.inc += 1 }); }}>Shuffle</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Update</button>
        {
          <Provider store={store}>
            {(this.state.inc % 2 === 1) ?
            (
              <Aggregator>
                <Section key="1" name="1" sectionKey="1" />
                <Section key="2" name="2" sectionKey="2" />
                <Section key="3" name="Section Without Key" />
              </Aggregator>
            ) :
            (
              <Aggregator>
                <Section key="3" name="Section Without Key" />
                <Section key="2" name="2" sectionKey="2" />
                <Section key="1" name="1" sectionKey="1" />
              </Aggregator>
            )}
          </Provider>
        }
      </div>
    );


    return body;
  }
}

AggregatorExample.propTypes = propTypes;

export default AggregatorExample;
