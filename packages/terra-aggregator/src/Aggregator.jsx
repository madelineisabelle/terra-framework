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
    this.lockMap = new Map();

    this.sectionKeyCounter = 0;

    this.state = {
      focusSectionId: undefined,
      focusSectionData: undefined,
      childMap: this.buildChildMap(this.props.children),
    };
  }

  componentWillReceiveProps(nextProps) {
    const newFocusItemId = nextProps.focusItemId;

    if (nextProps.children !== this.props.children) {
      const newChildMap = this.buildChildMap(nextProps.children);

      let focusItemIdIsPresent;
      newChildMap.forEach((value) => {
        // We check to see if the current section with focus is present within the new props.
        // If present, the existing state and disclosure are persisted.
        if (value.id === newFocusItemId) {
          focusItemIdIsPresent = true;
        }
      });

      if (!focusItemIdIsPresent) {
        nextProps.reset();
      }

      this.setState({
        childMap: newChildMap,
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
        registerFocusLockInstance: (lock) => { this.lockMap.set(childId, lock); },
      });
    });

    return newMap;
  }

  renderChildren() {
    const { children, focusItemId, focusItemState } = this.props;
    const { childMap } = this.state;

    return React.Children.map(children, (child) => {
      const childData = childMap.get(child);
      const childIsActive = focusItemId === childData.id;

      return React.cloneElement(child, {
        aggregatorDelegate: {
          hasFocus: childIsActive,
          registerFocusLock: childData.registerFocusLockInstance,
          requestFocus: childData.requestFocusInstance,
          releaseFocus: childIsActive ? childData.releaseFocusInstance : undefined,
          state: childIsActive ? focusItemState : undefined,
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

      this.props.setFocus(sectionId, Object.freeze(selectionData || {}));

      return this.disclose;
    });
  }

  releaseFocus(sectionId) {
    if (sectionId !== this.props.focusItemId) {
      return Promise.reject();
    }

    return Promise.all(this.getLockPromises())
    .then(() => {
      this.focusSectionLock = undefined;
      this.disclosureLock = undefined;

      this.props.reset();
    });
  }

  disclose(stuff) {
    this.props.openPanel(stuff);
  }

  render() {
    const { disclosureIsOpen, disclosureSize, disclosureComponentData, focusItemId } = this.props;

    const renderedChildren = this.renderChildren();

    let disclosureComponent;
    if (disclosureIsOpen && disclosureComponentData) {
      const ComponentClass = AppDelegate.getComponentForDisclosure(disclosureComponentData.content.name);

      if (ComponentClass) {
        disclosureComponent = (
          <ComponentClass
            key={disclosureComponentData.content.key}
            {...disclosureComponentData.content.props}
            app={this.props.app}
            aggregatorDisclosureDelegate={{
              requestClose: () => this.releaseFocus(focusItemId),
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
