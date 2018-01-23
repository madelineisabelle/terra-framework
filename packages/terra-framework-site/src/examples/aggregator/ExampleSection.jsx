import React from 'react';
import Button from 'terra-button';
import SelectableList from 'terra-list/lib/SelectableList';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';
// import AppDelegate from 'terra-app-delegate';

import { disclosureKey as disclosedContentDisclosureKey } from './DisclosedContent';
// import { disclosureKey as modalAggregatorDisclosureKey, reducers } from './ModalAggregator';

class Section extends React.Component {
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
      alert(`${this.props.name} is locked`);
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
          console.log('focus release failed; must be locked');
        });
      return;
    }

    aggregatorDelegate.requestFocus({
      index,
    })
    .then((disclose) => {
      disclose({
        preferredType: 'panel',
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
    })
    .catch((error) => {
      debugger;
      console.log(`selection denied ${error}`);
    });
  }

  launchModal() {
    // const key = `ModalContent-${Date.now()}`;

    // this.props.app.disclose({
    //   preferredType: 'modal',
    //   size: 'medium',
    //   content: {
    //     key,
    //     name: modalAggregatorDisclosureKey,
    //     props: {
    //       identifier: key,
    //     },
    //   },
    // });
  }

  render() {
    const { name, aggregatorDelegate } = this.props;
    const { isLocked } = this.state;

    let selectedIndex;
    if (aggregatorDelegate.hasFocus && aggregatorDelegate.state && aggregatorDelegate.state.index !== undefined) {
      selectedIndex = aggregatorDelegate.state.index;
    }

    return (
      <ContentContainer
        header={(
          <Header
            title={name} startContent={(
              <div>
                {!isLocked ? <Button text="Lock" onClick={this.lock} /> : <Button text="Unlock" onClick={this.unlock} />}
                <Button text="Modal" onClick={this.launchModal} />
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

export default Section;

// export { reducers };
