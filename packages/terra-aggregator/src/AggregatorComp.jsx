import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';

const propTypes = {
  children: PropTypes.node,
  focusItemId: PropTypes.string,
  focusItemState: PropTypes.object,

  clearFocus: PropTypes.func,
  setFocus: PropTypes.func,

  render: PropTypes.func,
  app: AppDelegate.propType,
};

class AggregatorComp extends React.Component {
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

  buildChildMap(children) {
    const newMap = new Map();

    React.Children.forEach(children, (child) => {
      const childId = child.props.sectionKey ? child.props.sectionKey : `aggregator-section-${Date.now()}`;

      newMap.set(child, {
        id: childId,
        requestFocusInstance: state => this.requestFocus(childId, state),
        releaseFocusInstance: () => this.releaseFocus(childId),
        registerLockInstance: (lock) => {
          // The lock is registered locally so the Aggregator has access to it for focus requests.
          this.lockMap.set(childId, lock);

          // The lock is also passed through to the app delegate implementation for direct manager integration.
          if (this.props.app.registerLock) {
            this.props.app.registerLock(lock);
          }
        },
      });
    });

    return newMap;
  }

  requestFocus(sectionId, selectionData) {
    return Promise.all(this.getLockPromises())
    .then(() => {
      this.props.setFocus(sectionId, Object.freeze(selectionData || {}));

      return data => this.props.app.disclose(data).then((onDismiss) => {
        onDismiss.then(() => {
          this.clearFocus();
        });
      });
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

  renderChildren() {
    const { children, focusItemId, focusItemState } = this.props;
    const { childMap } = this.state;

    return React.Children.map(children, (child) => {
      const childData = childMap.get(child);
      const childIsActive = focusItemId === childData.id;

      return React.cloneElement(child, {
        aggregatorDelegate: {
          hasFocus: childIsActive,
          requestFocus: childData.requestFocusInstance,
          releaseFocus: childIsActive ? childData.releaseFocusInstance : undefined,
          state: childIsActive ? focusItemState : undefined,
          registerLock: childData.registerLockInstance,
        },
      });
    });
  }

  render() {
    const renderedChildren = this.renderChildren();

    if (this.props.render) {
      return this.props.render(renderedChildren);
    }

    return (
      <div style={{ height: '100%' }}>
        {renderedChildren}
      </div>
    );
  }
}

AggregatorComp.propTypes = propTypes;

export default AggregatorComp;
