import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';

const propTypes = {
  app: AppDelegate.propType,
  children: PropTypes.node,
  render: PropTypes.func,
};

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestFocus = this.requestFocus.bind(this);
    this.releaseFocus = this.releaseFocus.bind(this);
    this.setFocus = this.setFocus.bind(this);
    this.resetFocus = this.resetFocus.bind(this);

    this.getLockPromises = this.getLockPromises.bind(this);
    this.buildChildMap = this.buildChildMap.bind(this);
    this.renderChildren = this.renderChildren.bind(this);

    // We don't need to keep these in state; doing so may trigger unnecessary renders.
    this.lockMap = new Map();

    this.sectionKeyCounter = 0;

    this.state = {
      childMap: this.buildChildMap(this.props.children),
      focusItemId: undefined,
      focusItemState: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { focusItemId } = this.state;


    if (nextProps.children !== this.props.children) {
      const newChildMap = this.buildChildMap(nextProps.children);


      let focusItemIdIsPresent;
      const newLockMap = new Map();

      newChildMap.forEach((value) => {
        // We need to copy along current locks and remove those of missing children.
        const existingLock = this.lockMap.get(value.id);
        if (existingLock) {
          newLockMap.set(value.id, existingLock);
        }

        // We check to see if the current section with focus is present within the new props.
        // If present, the existing state and disclosure are persisted.
        if (value.id === focusItemId) {
          focusItemIdIsPresent = true;
        }
      });

      this.lockMap = newLockMap;

      if (!focusItemIdIsPresent) {
        this.resetFocus();
      }

      this.setState({
        childMap: newChildMap,
      });
    }
  }

  getLockPromises() {
    const { focusItemId } = this.state;

    const lockPromises = [Promise.resolve()];
    const itemLockPromise = this.lockMap.get(focusItemId);

    if (itemLockPromise) {
      lockPromises.push(itemLockPromise());
    }

    return lockPromises;
  }

  buildChildMap(children) {
    const { app } = this.props;
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
          if (app && app.registerLock) {
            app.registerLock(lock);
          }
        },
      });
    });

    return newMap;
  }

  requestFocus(sectionId, selectionData) {
    const { app } = this.props;

    return Promise.all(this.getLockPromises())
    .then(() => {
      this.setFocus(sectionId, Object.freeze(selectionData || {}));

      if (app && app.disclose) {
        return (data) => {
          const disclosePromise = app.disclose(data);

          if (disclosePromise) {
            return disclosePromise.then(({ onDismiss }) => {
              onDismiss.then(() => {
                this.resetFocus();
              });
            });
          }

          return Promise.resolve();
        };
      }

      return Promise.resolve();
    });
  }

  releaseFocus(sectionId) {
    const { app } = this.props;
    const { focusItemId } = this.state;

    if (sectionId !== focusItemId) {
      return Promise.reject();
    }

    return Promise.all(this.getLockPromises())
      .then(() => {
        if (app && app.dismiss) {
          app.dismiss()
          .then(() => {
            this.resetFocus();
          });
        }
      });
  }

  setFocus(id, state) {
    this.setState({
      focusItemId: id,
      focusItemState: state,
    });
  }

  resetFocus() {
    this.setState({
      focusItemId: undefined,
      focusItemState: undefined,
    });
  }

  renderChildren() {
    const { children } = this.props;
    const { childMap, focusItemId, focusItemState } = this.state;

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

Aggregator.propTypes = propTypes;

export default Aggregator;
