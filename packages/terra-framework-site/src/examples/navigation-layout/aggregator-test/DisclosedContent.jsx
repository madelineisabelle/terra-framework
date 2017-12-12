import React from 'react';
import Button from 'terra-button';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';
import TextField from 'terra-form/lib/TextField';

class DisclosedContent extends React.Component {
  constructor(props) {
    super(props);

    this.checkLockState = this.checkLockState.bind(this);

    this.state = {
      text: undefined,
    };
  }

  componentDidMount() {
    this.props.addDisclosureLock(this.checkLockState);
  }

  checkLockState() {
    if (this.state.text && this.state.text.length) {
      if (!confirm(`${this.props.name} has unsaved changes. Do you wish to continue?`)) {
        return Promise.reject();
      }
    }

    return Promise.resolve();
  }

  render() {
    const { id, name, requestClose, lock, unlock, clearOnClose } = this.props;

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
          {this.state.text && this.state.text.length ? <p>Dirty!</p> : <p>Not dirty!</p>}
          <TextField
            value={this.state.text || ''}
            onChange={(event) => {
              this.setState({
                text: event.target.value,
              });
            }}
          />
        </div>
      </ContentContainer>
    );
  }
}

export default DisclosedContent;
