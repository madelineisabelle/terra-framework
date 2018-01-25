import React from 'react';
import PropTypes from 'prop-types';
import Button from 'terra-button';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';

const propTypes = {
  aggregatorDelegate: PropTypes.object,
  name: PropTypes.string,
};

class FocusSection extends React.Component {
  constructor(props) {
    super(props);

    this.checkLockState = this.checkLockState.bind(this);
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);

    this.state = {
      isLocked: false,
    };
  }

  componentDidMount() {
    const { aggregatorDelegate } = this.props;

    if (aggregatorDelegate && aggregatorDelegate.registerLock) {
      aggregatorDelegate.registerLock(this.checkLockState);
    }
  }

  checkLockState() {
    if (this.state.isLocked) {
      alert(`${this.props.name} is locked, so the focus request was denied.`);
      return Promise.reject();
    }

    return Promise.resolve();
  }

  unlock() {
    this.setState({
      isLocked: false,
    });
  }

  lock() {
    this.setState({
      isLocked: true,
    });
  }

  render() {
    const { name, aggregatorDelegate, ...customProps } = this.props;
    const { isLocked } = this.state;

    return (
      <ContentContainer
        {...customProps}
        header={(
          <Header
            title={name} startContent={(
              <div style={{ marginRight: '10px' }}>
                {!isLocked ? <Button text="Lock" onClick={this.lock} isDisabled={!aggregatorDelegate.hasFocus} /> : <Button text="Unlock" onClick={this.unlock} />}
              </div>
          )}
          />
        )}
      >
        { aggregatorDelegate.hasFocus ?
          <button
            onClick={() => {
              aggregatorDelegate.releaseFocus();
            }}
          >
            Release Focus
          </button> :
          <button
            onClick={() => {
              aggregatorDelegate.requestFocus();
            }}
          >
            Get Focus
          </button>
        }
        {
          aggregatorDelegate.hasFocus ? <h4>Section has focus!</h4> : null
        }
      </ContentContainer>
    );
  }
}

FocusSection.propTypes = propTypes;

export default FocusSection;
