import React from 'react';
import PropTypes from 'prop-types';
import Aggregator from 'terra-aggregator';
import Grid from 'terra-grid';
import DisclosureSection from './DisclosureSection';

const propTypes = {
  size: PropTypes.string,
};

const sections = Object.freeze([
  <DisclosureSection key="1" name="Section 0" aggregatorKey="Section 0" />,
  <DisclosureSection key="2" name="Section 1" aggregatorKey="Section 1" />,
  <DisclosureSection key="3" name="Section 2" aggregatorKey="Section 2" />,
  <DisclosureSection key="4" name="Section 3" aggregatorKey="Section 3" />,
]);

class SimpleAggregatorExample extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      flip: false,
    };
  }

  render() {
    const body = (
      <div>
        <h3>Aggregator with no parent disclosure managers</h3>
        <button onClick={() => { this.setState({ flip: !this.state.flip }); }}>Flip Section Order</button>
        <button onClick={() => { this.forceUpdate(); }}>Force Aggregator Render</button>
        <Aggregator>
          {this.state.flip ? Object.assign([], sections).reverse() : sections }
        </Aggregator>
        <br />
        <br />
        <h3>Aggregator with custom render</h3>
        <Aggregator
          render={children => (
            <div style={{ height: '100%' }}>
              <Grid>
                <Grid.Row>
                  <Grid.Column col={6}>
                    {children[0]}
                  </Grid.Column>
                  <Grid.Column col={6}>
                    {children[1]}
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column col={6}>
                    {children[2]}
                  </Grid.Column>
                  <Grid.Column col={6}>
                    {children[3]}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </div>
          )}
        >
          {this.state.flip ? Object.assign([], sections).reverse() : sections }
        </Aggregator>
      </div>
    );

    return body;
  }
}

SimpleAggregatorExample.propTypes = propTypes;

export default SimpleAggregatorExample;
