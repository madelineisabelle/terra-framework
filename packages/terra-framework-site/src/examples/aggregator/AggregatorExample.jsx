import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';
import Section from './ExampleSection';

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
        <button onClick={() => { this.setState({ inc: this.state.inc += 1 }); }}>Inc</button>
        <button onClick={() => { this.forceUpdate(); }}>Update</button>
        {
          (this.state.inc % 2 === 1) ?
          (
            <Aggregator>
              <Section key="1" name="1" sectionKey="1" />
              <Section key="2" name="2" sectionKey="2" />
            </Aggregator>
          ) :
          (
            <Aggregator>
              <Section key="2" name="2" sectionKey="2" />
              <Section key="1" name="1" sectionKey="1" />
            </Aggregator>
          )
        }
      </div>
    );


    return body;
  }
}

AggregatorExample.propTypes = propTypes;

export default AggregatorExample;
