import React from 'react';
import PropTypes from 'prop-types';
import Button from 'terra-button';
import SelectableList from 'terra-list/lib/SelectableList';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';
import AppDelegate from 'terra-app-delegate';
import ActionHeader from 'terra-clinical-action-header';

import { disclosureKey as disclosedContentDisclosureKey } from './DisclosedContent';

const ReadonlyModal = ({ app }) => (
  <ContentContainer
    header={(
      <ActionHeader
        title="Info Modal"
        onClose={app.closeDisclosure}
        onBack={app.goBack}
      />
    )}
  >
    <div style={{ padding: '15px' }}>
      <p>This modal is not presented through the Aggregator. If the SlidePanel was open, it should still be open</p>
    </div>
  </ContentContainer>
);

AppDelegate.registerComponentForDisclosure('ReadonlyModal', ReadonlyModal);

const propTypes = {
  aggregatorDelegate: PropTypes.object,
  name: PropTypes.string,
  disclosureType: PropTypes.string,
};

class DisclosureSection extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
    this.checkLockState = this.checkLockState.bind(this);
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);
    this.launchModal = this.launchModal.bind(this);

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

  handleSelection(event, index) {
    const { aggregatorDelegate, name } = this.props;

    if (aggregatorDelegate.hasFocus && aggregatorDelegate.state.index === index) {
      aggregatorDelegate.releaseFocus()
        .catch(() => {
          console.log('Section - Focus release failed. Something must be locked.');
        });
      return;
    }

    aggregatorDelegate.requestFocus({
      index,
    })
    .then(({ disclose }) => {
      if (disclose) {
        disclose({
          preferredType: this.props.disclosureType,
          size: 'small',
          content: {
            key: 'DisclosedContent-Demo',
            name: disclosedContentDisclosureKey,
            props: {
              key: name + index,
              id: name,
              name: `Disclosure from ${name} - Row ${index}`,
            },
          },
        });
      }
    })
    .catch((error) => {
      console.log(`Section - Selection denied - ${error}`);
    });
  }

  launchModal() {
    const { app } = this.props;

    const key = `ModalContent-${Date.now()}`;

    app.disclose({
      preferredType: 'modal',
      size: 'small',
      content: {
        key,
        name: 'ReadonlyModal',
      },
    });
  }

  render() {
    const { app, name, aggregatorDelegate, ...customProps } = this.props;
    const { isLocked } = this.state;

    let selectedIndex;
    if (aggregatorDelegate.hasFocus && aggregatorDelegate.state && aggregatorDelegate.state.index !== undefined) {
      selectedIndex = aggregatorDelegate.state.index;
    }

    return (
      <ContentContainer
        {...customProps}
        header={(
          <Header
            title={name} startContent={(
              <div style={{ marginRight: '10px' }}>
                {!isLocked ? <Button text="Lock" onClick={this.lock} isDisabled={!aggregatorDelegate.hasFocus} /> : <Button text="Unlock" onClick={this.unlock} />}
                {app ? <Button text="Launch Modal" onClick={this.launchModal} /> : null}
              </div>
          )}
          />
        )}
      >
        <SelectableList
          isDivided
          selectedIndexes={selectedIndex !== undefined ? [selectedIndex] : []}
          onChange={this.handleSelection}
        >
          <SelectableList.Item
            content={
              <div style={{ padding: '10px' }}>Row 0</div>
            }
          />
          <SelectableList.Item
            content={
              <div style={{ padding: '10px' }}>Row 1</div>
            }
          />
          <SelectableList.Item
            content={
              <div style={{ padding: '10px' }}>Row 2</div>
            }
          />
        </SelectableList>
      </ContentContainer>
    );
  }
}

DisclosureSection.propTypes = propTypes;

export default DisclosureSection;
