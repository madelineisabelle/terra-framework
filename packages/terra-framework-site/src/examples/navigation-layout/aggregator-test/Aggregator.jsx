import React from 'react';
import SlidePanel from 'terra-slide-panel';

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestSelection = this.requestSelection.bind(this);
    this.disclose = this.disclose.bind(this);
    this.closeDisclosure = this.closeDisclosure.bind(this);
    this.lock = this.lock.bind(this);
    this.unlock = this.unlock.bind(this);

    this.state = {
      disclosure: undefined,
      activeSection: undefined,
      sectionLock: false,
    };
  }

  requestSelection(sectionId, lock) {
    if (this.state.sectionLock) {
      return Promise.reject();
    }

    this.setState({
      sectionLock: lock,
      activeSection: sectionId,
    });

    return Promise.resolve(this.disclose);
  }

  closeDisclosure(sectionId, clearFocus) {
    if (this.state.activeSection !== sectionId || this.state.sectionLock) {
      return Promise.reject();
    }

    this.setState({
      disclosure: undefined,
      activeSection: clearFocus ? undefined : this.state.activeSection,
    });

    return Promise.resolve();
  }

  lock(sectionId) {
    if (this.state.activeSection !== sectionId) {
      return Promise.reject();
    }

    this.setState({
      sectionLock: true,
    });

    return Promise.resolve();
  }

  unlock(sectionId) {
    if (this.state.activeSection !== sectionId) {
      return Promise.reject();
    }

    this.setState({
      sectionLock: false,
    });

    return Promise.resolve();
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
            close: this.closeDisclosure,
            lock: this.lock,
            unlock: this.unlock,
            isLocked: this.state.sectionLock,
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
