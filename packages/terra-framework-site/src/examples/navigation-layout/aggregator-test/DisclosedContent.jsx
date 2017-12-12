import React from 'react';
import Button from 'terra-button';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';

class DisclosedContent extends React.Component {
  constructor(props) {
    super(props);

    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);
    this.checkLockState = this.checkLockState.bind(this);

    this.state = {
      isLocked: false,
    };
  }

  componentDidMount() {
    this.props.addDisclosureLock(this.checkLockState);
  }

  checkLockState() {
    if (this.state.isLocked) {
      alert(`${this.props.name} Detail is locked`);
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
    const { id, name, requestClose, lock, unlock, clearOnClose } = this.props;
    const { isLocked } = this.state;

    return (
      <ContentContainer header={<Header title={'Disclosed Content'} />}>
        <div style={{ padding: '10px' }}>
          <h3>{name}</h3>
          <Button
            text="Close" onClick={() => {
              requestClose(id, clearOnClose)
                .then(() => {
                  console.log('Close succeeded');
                })
                .catch(() => {
                  console.log('Closed failed');
                });
            }}
          />
          {!isLocked && <Button text="Lock" onClick={this.lock} />}
          {isLocked && <Button text="Unlock" onClick={this.unlock} />}
        </div>
      </ContentContainer>
    );
  }
}

export default DisclosedContent;
