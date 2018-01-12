import React from 'react';
import SlidePanel from 'terra-slide-panel';

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestFocus = this.requestFocus.bind(this);
    this.removeFocus = this.removeFocus.bind(this);
    this.disclose = this.disclose.bind(this);

    this.getLockPromises = this.getLockPromises.bind(this);
    this.buildChildMap = this.buildChildMap.bind(this);
    this.generateSectionKey = this.generateSectionKey.bind(this);
    this.renderChildren = this.renderChildren.bind(this);

    // We don't need to keep these in state; doing so may trigger unnecessary renders.
    this.focusSectionLock = undefined;
    this.disclosureLock = undefined;

    this.sectionKeyCounter = 0;

    this.state = {
      focusSectionId: undefined,
      focusSectionData: undefined,
      disclosure: undefined,
      childMap: this.buildChildMap(this.props.children),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      const newChildMap = this.buildChildMap(nextProps.children);

      let newFocusSectionId;
      let newFocusSelectionData;
      let newDisclosure;

      newChildMap.forEach((value, key, map) => {
        if (value.id === this.state.focusSectionId) {
          newFocusSectionId = value.id;
          newFocusSelectionData = this.state.focusSectionData;
          newDisclosure = this.state.disclosure;
        }
      });

      this.setState({
        childMap: newChildMap,
        focusSectionId: newFocusSectionId,
        focusSectionData: newFocusSelectionData,
        disclosure: newDisclosure,
      });
    }
  }

  generateSectionKey() {
    const newKey = `aggregator-section-${this.sectionKeyCounter}`;

    this.sectionKeyCounter += 1;

    return newKey;
  }

  buildChildMap(children) {
    const newMap = new Map();

    React.Children.forEach(children, (child) => {
      const childId = child.props.sectionKey ? child.props.sectionKey : this.generateSectionKey();

      newMap.set(child, {
        id: childId,
        requestFocusInstance: (lock, state) => this.requestFocus(childId, lock, state),
        removeFocusInstance: () => this.removeFocus(childId),
      });
    });

    return newMap;
  }

  renderChildren() {
    return React.Children.map(this.props.children, (child) => {
      const childData = this.state.childMap.get(child);

      const childIsActive = this.state.focusSectionId === childData.id;

      return React.cloneElement(child, {
        aggregator: {
          sectionIsFocused: childIsActive,
          focusData: childIsActive ? this.state.focusSectionData : undefined,
          requestFocus: childData.requestFocusInstance,
          removeFocus: childData.removeFocusInstance,
        },
      });
    });
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
    const renderedChildren = this.renderChildren();

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
          renderedChildren
        }
      />
    );
  }
}

export default Aggregator;
