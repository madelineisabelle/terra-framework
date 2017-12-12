import React from 'react';
import SlidePanel from 'terra-slide-panel';

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestSelection = this.requestSelection.bind(this);
    this.disclose = this.disclose.bind(this);
    this.closeDisclosure = this.closeDisclosure.bind(this);

    this.state = {
      activeSection: undefined,
      activeSectionLock: undefined,
      disclosure: undefined,
      disclosureLock: undefined,
    };
  }

  requestSelection(sectionId, sectionLock) {
    const { activeSectionLock, activeDisclosureLock } = this.state;

    return Promise.all([activeSectionLock && activeSectionLock(), activeDisclosureLock && activeDisclosureLock()])
    .then(() => {
      this.setState({
        activeSection: sectionId,
        activeSectionLock: sectionLock,
      });
      return this.disclose;
    });
  }

  closeDisclosure(sectionId, clearFocus) {
    const { disclosureLock } = this.state;

    return Promise.all([disclosureLock && disclosureLock()])
    .then(() => {
      this.setState({
        activeSection: clearFocus ? undefined : this.state.activeSection,
        activeSectionLock: clearFocus ? undefined : this.state.activeSectionLock,
        disclosure: undefined,
        disclosureLock: undefined,
      });
    });
  }

  disclose(stuff) {
    if (stuff) {
      this.setState({
        disclosure: stuff,
      });
    }
  }

  render() {
    return (
      <SlidePanel
        fill
        panelBehavior="squish"
        isOpen={!!this.state.disclosure}
        panelContent={this.state.disclosure &&
          React.cloneElement(this.state.disclosure, {
            requestClose: this.closeDisclosure,
            addDisclosureLock: (lock) => {
              this.setState({
                disclosureLock: lock,
              });
            },
          })
        }
        mainContent={
          React.Children.map(this.props.children, child => (
            React.cloneElement(child, {
              activeSection: this.state.activeSection,
              requestSelection: this.requestSelection,
            })
          ))
        }
      />
    );
  }
}


export default Aggregator;
