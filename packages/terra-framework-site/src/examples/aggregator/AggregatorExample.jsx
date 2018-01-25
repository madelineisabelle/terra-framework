import React from 'react';
import PropTypes from 'prop-types';
import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import Aggregator from 'terra-aggregator';
import NewModalManager from 'terra-aggregator/lib/NewModalManager';
import SlidePanelManager from 'terra-aggregator/lib/SlidePanelManager';
import ModalManager, { reducers as modalManagerReducers } from 'terra-modal-manager';

import Section from './ExampleSection';

const store = createStore(
  combineReducers(Object.assign({},
    modalManagerReducers,
  )),
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
);

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <Section key="1" name="1" sectionKey="1" />,
  <Section key="2" name="2" sectionKey="2" />,
  <Section key="3" name="3" sectionKey="3" />,
]);

class AggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Update</button>
        {
          <Provider store={store}>
            <NewModalManager>
              <SlidePanelManager>
                <Aggregator
                  render={children => (
                    <div style={{ height: '100%', padding: '15px' }}>
                      {children.map((child, index) => React.cloneElement(child, { style: { marginTop: index !== 0 ? '15px' : '0px', border: '1px solid lightgrey' } }))}
                    </div>
                  )}
                >
                  {this.state.flip ? Object.assign([], sections).reverse() : sections }
                </Aggregator>
              </SlidePanelManager>
            </NewModalManager>
          </Provider>
        }
      </div>
    );

    return body;
  }
}

AggregatorExample.propTypes = propTypes;

export default AggregatorExample;
