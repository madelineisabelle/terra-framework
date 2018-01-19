import React from 'react';
import PropTypes from 'prop-types';
import SlidePanel from 'terra-slide-panel';
import AppDelegate from 'terra-app-delegate';
import SlideGroup from 'terra-slide-group';

const propTypes = {
  children: PropTypes.node,
  focusItemId: PropTypes.string,
  focusItemState: PropTypes.object,

  clearFocus: PropTypes.func,
  setFocus: PropTypes.func,
  openDisclosure: PropTypes.func,

  disclosureIsOpen: PropTypes.bool,
  disclosureSize: PropTypes.string,
  disclosureComponentData: PropTypes.array,
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
    this.disclosureLocks = {};

    this.state = {
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
        nextProps.clearFocus();
      }

      this.setState({
        childMap: newChildMap,
      });
    }
  }

  getLockPromises() {
    const { focusItemId } = this.props;

    const lockPromises = [Promise.resolve()];
    const itemLockPromise = this.lockMap.get(focusItemId);

    if (itemLockPromise) {
      lockPromises.push(itemLockPromise());
    }

    if (this.disclosureLocks) {
      lockPromises.push(Promise.all(Object.values(this.disclosureLocks).map(lock => lock && lock())));
    }

    return lockPromises;
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
        requestFocusInstance: state => this.requestFocus(childId, state),
        releaseFocusInstance: () => this.releaseFocus(childId),
        registerLockInstance: (lock) => { this.lockMap.set(childId, lock); },
      });
    });

    return newMap;
  }

  requestFocus(sectionId, selectionData) {
    return Promise.all(this.getLockPromises())
    .then(() => {
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
        this.disclosureLocks = {};
        this.props.clearFocus();
      });
  }

  disclose(stuff) {
    this.props.openDisclosure(stuff);
  }

  renderChildren() {
    const { children, focusItemId, focusItemState, app } = this.props;
    const { childMap } = this.state;

    return React.Children.map(children, (child) => {
      const childData = childMap.get(child);
      const childIsActive = focusItemId === childData.id;

      const newApp = AppDelegate.clone(app, {
        registerLock: childData.registerLockInstance,
      });

      return React.cloneElement(child, {
        app: newApp,
        aggregatorDelegate: {
          hasFocus: childIsActive,
          requestFocus: childData.requestFocusInstance,
          releaseFocus: childIsActive ? childData.releaseFocusInstance : undefined,
          state: childIsActive ? focusItemState : undefined,
        },
      });
    });
  }

  buildDisclosureComponents() {
    const { app, disclosureComponentData, pushDisclosure, popDisclosure, focusItemId } = this.props;

    return disclosureComponentData.map((componentData, index) => {
      const ComponentClass = AppDelegate.getComponentForDisclosure(componentData.name);

      if (!ComponentClass) {
        return undefined;
      }

      const appDelegate = AppDelegate.create({
        disclose: (data) => {
          if (data.preferredType === 'panel' || !app) {
            pushDisclosure(data);

            return Promise.resolve();
          }
          return app.disclose(data);
        },
        dismiss: (index > 0 ?
          (data) => {
            const lockForDisclosure = this.disclosureLocks[componentData.key];
            if (lockForDisclosure) {
              return lockForDisclosure()
                .then(() => {
                  popDisclosure(data);
                  this.disclosureLocks[componentData.key] = undefined;
                });
            }

            popDisclosure(data);
            return Promise.resolve();
          } :
          () => this.releaseFocus(focusItemId)
        ),
        closeDisclosure: () => this.releaseFocus(focusItemId),
        goBack: index > 0 ? (data) => {
          const lockForDisclosure = this.disclosureLocks[componentData.key];
          if (lockForDisclosure) {
            return lockForDisclosure()
              .then(() => {
                popDisclosure(data);
                this.disclosureLocks[componentData.key] = undefined;
              });
          }

          popDisclosure(data);
          return Promise.resolve();
        } : null,
        registerLock: (lockPromise) => {
          this.disclosureLocks[componentData.key] = lockPromise;

          return Promise.resolve();
        },
      });

      return <ComponentClass key={componentData.key} {...componentData.props} app={appDelegate} />;
    });
  }

  render() {
    const { disclosureIsOpen, disclosureSize } = this.props;

    const renderedChildren = this.renderChildren();

    const generatedDisclosureComponents = this.buildDisclosureComponents();

    return (
      <SlidePanel
        fill
        panelBehavior="squish"
        panelSize={disclosureSize}
        isOpen={disclosureIsOpen}
        panelContent={(
          <SlideGroup items={generatedDisclosureComponents} isAnimated />
        )}
        mainContent={renderedChildren}
      />
    );
  }
}

Aggregator.propTypes = propTypes;

export default Aggregator;