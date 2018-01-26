import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  children: PropTypes.node,
  render: PropTypes.func,
  disclose: PropTypes.func,
};

class Aggregator extends React.Component {
  constructor(props) {
    super(props);

    this.requestFocus = this.requestFocus.bind(this);
    this.releaseFocus = this.releaseFocus.bind(this);
    this.setFocusState = this.setFocusState.bind(this);
    this.resetFocusState = this.resetFocusState.bind(this);
    this.generateChildMap = this.generateChildMap.bind(this);
    this.renderChildren = this.renderChildren.bind(this);

    this.state = {
      childMap: this.generateChildMap(this.props.children),
      focusItemId: undefined,
      focusItemState: undefined,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { focusItemId } = this.state;

    /**
     * On the off-chance that the consuming component is using an immutable child array,
     * we will only rebuild the child data if a difference is detected.
     */
    if (nextProps.children !== this.props.children) {
      let focusItemIdIsPresent;
      const newChildMap = this.generateChildMap(nextProps.children);

      newChildMap.forEach((value) => {
        /**
         * We check to see if the current section with focus is present within the new props.
         * If present, the existing state and disclosure are persisted.
         */
        if (value.id === focusItemId) {
          focusItemIdIsPresent = true;
        }
      });

      if (!focusItemIdIsPresent) {
        this.releaseFocus(undefined, true);
      }

      this.setState({
        childMap: newChildMap,
      });
    }
  }

  setFocusState(id, state) {
    this.setState({
      focusItemId: id,
      focusItemState: state,
    });
  }

  resetFocusState() {
    this.setFocusState();
  }

  generateChildMap(children) {
    const newMap = new Map();

    /**
     * Given the amount of functions being passed around to the various Aggregator items, we generate
     * the item-specific functions once and reuse them for subsequent render calls. This mapping is
     * first generated in the constructor and is subsequently regenerated within componentWillReceiveProps
     * if new children are provided.
     */
    React.Children.forEach(children, (child) => {
      const childId = child.props.aggregatorKey ? child.props.aggregatorKey : `aggregator-section-${Date.now()}`;

      newMap.set(child, {
        id: childId,
        requestFocusInstance: state => this.requestFocus(childId, state),
        releaseFocusInstance: () => this.releaseFocus(childId),
      });
    });

    return newMap;
  }

  requestFocus(sectionId, selectionData) {
    const { disclose } = this.props;
    const { focusItemId } = this.state;

    return Promise.resolve()
      .then(() =>
        /**
         * Focus is released on the currently focused item to ensure a clean start for the next component receiving focus.
         * The releaseFocus's Promise is returned and inserted into the Promise chain to prevent disclosures from occurring
         * if the focus release fails.
         */
        this.releaseFocus(focusItemId)
          .then(() => {
            this.setFocusState(sectionId, Object.freeze(selectionData || {}));
          }),
      )
      .then(() => {
        const focusRequestPayload = {};

        /**
         * If the Aggregator is provided with disclosure functionality, the focus request is resolved with a custom
         * disclose implementation.
         */
        if (disclose) {
          focusRequestPayload.disclose = data => disclose(data)
            .then(({ onDismiss, forceDismiss }) => {
              /**
               * The disclosure's forceDismiss instance is cached so it can be called later. If an Aggregator item is
               * currently presenting a disclosure and releases focus, we will call this forceDismiss instance to force
               * the disclosure to close.
               */

              this.forceDismissInstance = forceDismiss;
              this.onDismissInstance = onDismiss;

              /**
               * A handler is added deferred onDismiss promise chain to remove the cached forceDismiss instance (the disclosure is
               * closing, so it is no longer relevant). The handler also resets the focus state if the current item in state
               * matches the item being dismissed.
               */
              this.onDismissInstance.then(() => {
                this.forceDismissInstance = undefined;
                this.onDismissInstance = undefined;

                if (this.state.focusItemId) {
                  this.resetFocusState();
                }
              });

              return { onDismiss, forceDismiss };
            });
        }

        return focusRequestPayload;
      });
  }

  releaseFocus(itemId, force) {
    // If nothing is currently in focus, we can resolve immediately.
    if (!this.state.focusItemId) {
      return Promise.resolve();
    }

    /**
     * If the provided item ID is not the currently focused ID, and the release is not forced,
     * the release is rejected to protect against delayed calls.
     */
    if (itemId !== this.state.focusItemId && !force) {
      return Promise.reject();
    }

    return Promise.resolve()
      .then(() => {
        /**
         * If forceDismissInstance is present, a disclosure must have been opened by the currently focused
         * Aggregator item. Therefore, we will call the forceDismissInstance in order to keep things in sync. The promise
         * returned by forceDismissInstance will be inserted into the Promise chain.
         *
         * The focus is only reset if the disclosure was dismissed successfully.
         */
        if (this.forceDismissInstance) {
          return this.forceDismissInstance().then(() => {
            this.resetFocusState();
          });
        }

        // If a previous disclosure is not detected, we can immediately resolve and reset the focus.
        return Promise.resolve().then(() => {
          this.resetFocusState();
        });
      });
  }

  renderChildren() {
    const { children } = this.props;
    const { childMap, focusItemId, focusItemState } = this.state;

    return React.Children.map(children, (child) => {
      const childData = childMap.get(child);
      const childIsActive = focusItemId === childData.id;

      /**
       * Each child given to the Aggregator is provided with an 'aggregatorDelegate' prop with the following values:
       * hasFocus - A Boolean flag indicating whether or not the child is currently focused
       * requestFocus - A function that will attempt to provide focus to the calling child. It takes an Object parameter that
       *                should hold state data relevant to the focus event. The function returns a Promise that is resolved if
       *                the focus request was successful. The Promise is resolved with a 'disclose' function that can be used to
       *                disclose further content in a manner managed by the Aggregator. If the focus request was unsuccessful, the
       *                Promise will be rejected.
       * releaseFocus - A function that will attempt to release the focus held by the calling child. Returns a promse that is
       *                resolved if the release request was successful. If the release request was unsuccessful, the
       *                Promise will be rejected. This function is only provided to components that are focused.
       * state - An Object containing the state given to the Aggregator during the focus request.
       */
      return React.cloneElement(child, {
        aggregatorDelegate: {
          hasFocus: childIsActive,
          requestFocus: childData.requestFocusInstance,
          releaseFocus: childIsActive ? childData.releaseFocusInstance : undefined,
          state: childIsActive ? focusItemState : undefined,
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
