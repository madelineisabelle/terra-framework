import React from 'react';
import PropTypes from 'prop-types';
import Button from 'terra-button';
import SelectableList from 'terra-list/lib/SelectableList';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';
import AppDelegate from 'terra-app-delegate';
import ActionHeader from 'terra-clinical-action-header';
import DatePicker from 'terra-date-picker';

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

  disclose: PropTypes.func,
  registerDismissCheck: PropTypes.func,
  requestDisclosureFocus: PropTypes.func,
  releaseDisclosureFocus: PropTypes.func,
};

class DisclosureSection extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
    this.launchModal = this.launchModal.bind(this);
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
    const { disclose } = this.props;

    const key = `ModalContent-${Date.now()}`;

    disclose({
      preferredType: 'modal',
      size: 'small',
      content: {
        key,
        name: 'ReadonlyModal',
      },
    });
  }

  render() {
    const { name, disclosureType, disclose, aggregatorKey, aggregatorDelegate, requestDisclosureFocus, releaseDisclosureFocus, registerDismissCheck, ...customProps } = this.props;

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
                {disclose ? <Button text="Launch Modal" onClick={this.launchModal} /> : null}
                <DatePicker name="header-date-picker" releaseFocus={releaseDisclosureFocus} requestFocus={requestDisclosureFocus} />
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
