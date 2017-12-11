import React from 'react';
import Button from 'terra-button';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';

class DisclosedContent extends React.Component {
  constructor(props) {
    super(props);

    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);
  }

  unlock() {
    this.props.unlock()
      .then(() => {
        console.log('Unlock succeeded');
      })
      .catch(() => {
        console.log('Unlock failed');
      });
  }

  lock() {
    this.props.lock()
      .then(() => {
        console.log('Lock succeeded');
      })
      .catch(() => {
        console.log('Lock failed');
      });
  }

  render() {
    const { id, name, close, lock, unlock, isLocked, clearOnClose } = this.props;

    return (
      <ContentContainer header={<Header title={'Disclosed Content'} />}>
        <div style={{ padding: '10px' }}>
          <h3>{name}</h3>
          <Button
            text="Close" onClick={() => {
              close(id, clearOnClose)
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
