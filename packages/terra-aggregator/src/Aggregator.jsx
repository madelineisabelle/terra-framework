import React from 'react';
import PropTypes from 'prop-types';
import SlidePanel from 'terra-slide-panel';
import AppDelegate from 'terra-app-delegate';

const propTypes = {
  children: PropTypes.node,
};

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestFocus = this.requestFocus.bind(this);
    this.releaseFocus = this.releaseFocus.bind(this);
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
      childMap: this.buildChildMap(this.props.children),
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.children !== this.props.children) {
      const newChildMap = this.buildChildMap(nextProps.children);

      let newFocusSectionId;
      let newFocusSelectionData;

      newChildMap.forEach((value) => {
        // We check to see if the current section with focus is present within the new props.
        // If present, the existing state and disclosure are persisted.
        if (value.id === this.state.focusSectionId) {
          newFocusSectionId = value.id;
          newFocusSelectionData = this.state.focusSectionData;
        }
      });

      this.setState({
        childMap: newChildMap,
        focusSectionId: newFocusSectionId,
        focusSectionData: newFocusSelectionData,
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
        releaseFocusInstance: () => this.releaseFocus(childId),
      });
    });

    return newMap;
  }

  renderChildren() {
    const { children } = this.props;
    const { childMap, focusSectionId, focusSectionData } = this.state;

    return React.Children.map(children, (child) => {
      const childData = childMap.get(child);
      const childIsActive = focusSectionId === childData.id;

      return React.cloneElement(child, {
        aggregatorDelegate: {
          hasFocus: childIsActive,
          requestFocus: childData.requestFocusInstance,
          releaseFocus: childIsActive ? childData.releaseFocusInstance : undefined,
          state: childIsActive ? focusSectionData : undefined,
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

  releaseFocus(sectionId) {
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
    const { disclosureIsOpen, disclosureSize, disclosureComponentData } = this.props;

    const renderedChildren = this.renderChildren();

    let disclosureComponent;
    if (disclosureIsOpen && disclosureComponentData) {
      const ComponentClass = AppDelegate.getComponentForDisclosure(disclosureComponentData.name);

      if (ComponentClass) {
        disclosureComponent = (
          <ComponentClass
            key={disclosureComponentData.key}
            {...disclosureComponentData.props}
            app={this.props.app}
            aggregatorDisclosureDelegate={{
              requestClose: () => this.releaseFocus(this.state.focusSectionId),
              addDisclosureLock: (lock) => {
                this.disclosureLock = lock;
              },
            }}
          />
        );
      }
    }

    return (
      <SlidePanel
        fill
        panelBehavior="overlay"
        isOpen={disclosureIsOpen}
        panelContent={disclosureComponent}
        mainContent={renderedChildren}
      />
    );
  }
}

Aggregator.propTypes = propTypes;

export default Aggregator;
