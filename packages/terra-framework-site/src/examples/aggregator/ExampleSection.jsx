import React from 'react';
import Button from 'terra-button';
import SelectableList from 'terra-list/lib/SelectableList';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';
import DisclosedContent from './DisclosedContent';

class Section extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);
    this.checkLockState = this.checkLockState.bind(this);
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);

    this.state = {
      isLocked: false,
    };
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
      aggregatorDelegate.releaseFocus();
      return;
    }

    aggregatorDelegate.requestFocus(this.checkLockState, {
      index,
    })
    .then((disclose) => {
      disclose((
        <DisclosedContent
          key={name + index}
          id={name}
          name={`Disclosure from ${name} - Row ${index}`}
        />
      ));
    })
    .catch((error) => {
      console.log(`selection denied ${error}`);
    });
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
            title={name} endContent={(
            !isLocked ? <Button text="Lock" onClick={this.lock} /> : <Button text="Unlock" onClick={this.unlock} />
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
