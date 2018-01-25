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
    this.lockMap = {};

    this.state = {
      childMap: this.buildChildMap(this.props.children),
      focusItemId: undefined,
      focusItemState: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { focusItemId } = this.state;

    // On the off-chance that the consuming component is using an immutable child array,
    // we will only rebuild the child data if a difference is detected.
    if (nextProps.children !== this.props.children) {
      let focusItemIdIsPresent;
      const newLockMap = {};
      const newChildMap = this.buildChildMap(nextProps.children);

      newChildMap.forEach((value) => {
        // We need to copy along current locks and remove those of missing children.
        const existingLock = this.lockMap[value.id];
        if (existingLock) {
          newLockMap[value.id] = existingLock;
        }

        // We check to see if the current section with focus is present within the new props.
        // If present, the existing state and disclosure are persisted.
        if (value.id === focusItemId) {
          focusItemIdIsPresent = true;
        }
      });

      this.lockMap = newLockMap;

      if (!focusItemIdIsPresent) {
        this.releaseFocus();
      }

      this.setState({
        childMap: newChildMap,
      });
    }
  }

  getLockPromises() {
    const itemLockPromise = this.lockMap[this.state.focusItemId];

    return [itemLockPromise && itemLockPromise()];
  }

  buildChildMap(children) {
    const { app } = this.props;
    const newMap = new Map();

    React.Children.forEach(children, (child) => {
      const childId = child.props.sectionKey ? child.props.sectionKey : `aggregator-section-${Date.now()}`;

      newMap.set(child, {
        id: childId,
        requestFocusInstance: state => this.requestFocus(childId, state),
        releaseFocusInstance: () => this.releaseFocus(),
        registerLockInstance: (lock) => {
          // The lock is registered locally so the Aggregator has access to it for focus requests.
          this.lockMap[childId] = lock;

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
      .then(() =>
        // Focus is released on the currently focused item to ensure a clean start for the next component receiving focus.
        // The releaseFocus's Promise is returned and inserted into the Promise chain to prevent disclosures from occurring
        // if the focus release fails.
        this.releaseFocus()
          .then(() => {
            this.setFocus(sectionId, Object.freeze(selectionData || {}));
          }),
      )
      .then(() => {
        const focusRequestPayload = {};

        // If the Aggregator is provided with disclosure functionality, the focus request is resolved with a custom
        // disclose implementation.
        if (app && app.disclose) {
          focusRequestPayload.disclose = data => app.disclose(data)
            .then(({ onDismiss, forceDismiss }) => {
              // The disclosure's forceDismiss instance is cached so it can be called later. If an Aggregator item is currently presenting
              // a disclosure and releases focus, we will call this forceDismiss instance to force the disclosure to close.
              this.forceDismissInstance = forceDismiss;
              this.onDismissInstance = onDismiss;

              // A handler is added deferred onDismiss promise chain to remove the cached forceDismiss instance (the disclosure is closing, so
              // it is no longer relevant). The handler also resets the focus state if the current item in state matches the item being dismissed.
              this.onDismissInstance.then(() => {
                this.forceDismissInstance = undefined;
                this.onDismissInstance = undefined;

                if (this.state.focusItemId) {
                  this.resetFocus();
                }
              });

              return { onDismiss, forceDismiss };
            });
        }

        return focusRequestPayload;
      });
  }

  releaseFocus() {
    // If nothing is currently in focus, we can resolve immediately.
    if (!this.state.focusItemId) {
      return Promise.resolve();
    }

    return Promise.all(this.getLockPromises())
      .then(() => {
        // If forceDismissInstance is present, a disclosure must have been opened by the currently focused
        // Aggregator item. Therefore, we will call the forceDismissInstance in order to keep things in sync. The promise
        // returned by forceDismissInstance will be inserted into the Promise chain.
        //
        // The focus is only reset if the disclosure was dismissed successfully.
        if (this.forceDismissInstance) {
          return this.forceDismissInstance().then(() => {
            this.resetFocus();
          });
        }

        // If a previous disclosure is not detected, we can immediately resolve and reset the focus.
        return Promise.resolve().then(() => {
          this.resetFocus();
        });
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
      <div>
        {renderedChildren}
      </div>
    );
  }
}

Aggregator.propTypes = propTypes;

export default Aggregator;
