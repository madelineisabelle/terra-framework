import React from 'react';
import SelectableList from 'terra-list/lib/SelectableList';
import ContentContainer from 'terra-content-container';
import Header from 'terra-clinical-header';
import DisclosedContent from './DisclosedContent';

class Section extends React.Component {
  constructor(props) {
    super(props);

    this.handleSelection = this.handleSelection.bind(this);

    this.state = {
      selectedIndex: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.sectionFocus !== nextProps.name) {
      this.setState({
        selectedIndex: undefined,
      });
    }
  }

  handleSelection(event, index) {
    this.props.requestSelection(this.props.name, false)
    .then((disclose) => {
      this.setState({
        selectedIndex: index,
      });

      disclose((
        <DisclosedContent
          id={this.props.name}
          name={`Disclosure from ${this.props.name} - Row ${index}`}
          clearOnClose
        />
      ));
    })
    .catch((error) => {
      console.log('selection denied');
    });
  }

  render() {
    const { name } = this.props;
    const { selectedIndex } = this.state;

    return (
      <ContentContainer header={<Header title={name} />}>
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
