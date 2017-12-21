import React from 'react';
import SlidePanel from 'terra-slide-panel';

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestFocus = this.requestFocus.bind(this);
    this.removeFocus = this.removeFocus.bind(this);
    this.disclose = this.disclose.bind(this);

    this.getLockPromises = this.getLockPromises.bind(this);

    // We don't need to keep these in state; doing so may trigger unnecessary renders.
    this.focusSectionLock = undefined;
    this.disclosureLock = undefined;

    this.state = {
      focusSectionId: undefined,
      focusSectionData: undefined,

      disclosure: undefined,
    };
  }

  getLockPromises() {
    const lockPromises = [Promise.resolve()];

    if (this.focusSectionLock) {
      lockPromises.push(this.focusSectionLock());
    }

    if (this.disclosureLock) {
      lockPromises.push(this.disclosureLock());
    }

    return lockPromises;
  }

  requestFocus(sectionId, sectionLock, selectionData) {
    return Promise.all(this.getLockPromises())
    .then(() => {
      this.focusSectionLock = sectionLock;

      this.setState({
        focusSectionId: sectionId,
        focusSectionData: Object.freeze(selectionData || {}),
      });
      return this.disclose;
    });
  }

  removeFocus(sectionId) {
    if (sectionId !== this.state.focusSectionId) {
      return Promise.reject();
    }

    return Promise.all(this.getLockPromises())
    .then(() => {
      this.focusSectionLock = undefined;
      this.disclosureLock = undefined;

      this.setState({
        focusSectionId: undefined,
        focusSectionData: undefined,
        disclosure: undefined,
      });
      return this.disclose;
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
            aggregator: {
              requestClose: () => { this.removeFocus(this.state.focusSectionId); },
              addDisclosureLock: (lock) => {
                this.disclosureLock = lock;
              },
            },
          })
        }
        mainContent={
          React.Children.map(this.props.children, child => (
            React.cloneElement(child, {
              aggregator: {
                activeSection: this.state.focusSectionId,
                sectionData: this.state.focusSectionData,
                requestFocus: this.requestFocus,
                removeFocus: this.removeFocus,
              },
            })
          ))
        }
      />
    );
  }
}


export default Aggregator;
