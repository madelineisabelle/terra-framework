import React from 'react';
import PropTypes from 'prop-types';
import Button from 'terra-button';
import ContentContainer from 'terra-content-container';
import TextField from 'terra-form/lib/TextField';
import AppDelegate from 'terra-app-delegate';
import ActionHeader from 'terra-clinical-action-header';

const propTypes = {
  app: AppDelegate.propType,
  name: PropTypes.string,
};

class DisclosedContent extends React.Component {
  constructor(props) {
    super(props);

    this.checkLockState = this.checkLockState.bind(this);

    this.state = {
      text: undefined,
    };
  }

  componentDidMount() {
    if (this.props.app && this.props.app.registerLock) {
      this.props.app.registerLock(this.checkLockState);
    }
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
    const { app, name } = this.props;

    return (
      <ContentContainer
        header={(
          <ActionHeader
            title={'Disclosed Content'}
            onClose={app.closeDisclosure}
            onBack={app.goBack}
          />
        )}
      >
        <div style={{ padding: '10px' }}>
          <h3>{name}</h3>
          <Button
            text="Dismiss"
            onClick={() => {
              app.dismiss()
                .then(() => {
                  console.log('Close succeeded');
                })
                .catch(() => {
                  console.log('Closed failed');
                });
            }}
          />
          <Button
            text="Disclose"
            onClick={() => {
              app.disclose({
                preferredType: 'panel',
                size: 'small',
                content: {
                  key: `Nested ${this.props.name}`,
                  name: 'DisclosedContent',
                  props: {
                    key: `Nested ${this.props.name}`,
                    name: `Nested ${this.props.name}`,
                  },
                },
              })
                .then(() => {
                  console.log('disclose succeeded');
                })
                .catch(() => {
                  console.log('disclose failed');
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

DisclosedContent.propTypes = propTypes;

export default DisclosedContent;

const disclosureKey = 'DisclosedContent';
AppDelegate.registerComponentForDisclosure(disclosureKey, DisclosedContent);
export { disclosureKey };
