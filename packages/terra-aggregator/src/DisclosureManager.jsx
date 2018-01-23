import React from 'react';
import PropTypes from 'prop-types';
import SlidePanel from 'terra-slide-panel';
import AppDelegate from 'terra-app-delegate';
import SlideGroup from 'terra-slide-group';

const propTypes = {
  app: AppDelegate.propType,
  children: PropTypes.node,

  supportedDisclosureTypes: PropTypes.array,
  disclosureIsOpen: PropTypes.bool,
  disclosureSize: PropTypes.string,
  disclosureComponentData: PropTypes.array,

  render: PropTypes.func,
};

class DisclosureManager extends React.Component {
  constructor(props) {
    super(props);

    this.getLockPromises = this.getLockPromises.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
    this.generateChildAppDelegate = this.generateChildAppDelegate.bind(this);

    // We don't need to keep these in state; doing so may trigger unnecessary renders.
    this.disclosureLocks = {};
    this.dismissMap = {};
    this.childLock = undefined;

    this.state = {
      disclosureIsOpen: false,
      disclosureSize: false,
      disclosureComponentData: undefined,
    };
  }

  getLockPromises() {
    const lockPromises = [];

    if (this.disclosureLocks) {
      lockPromises.push(Promise.all(Object.values(this.disclosureLocks).map(lock => lock && lock())));
    }

    return lockPromises;
  }

  cloneDisclosureState(state) {
    const newState = Object.assign({}, state);
    newState.disclosureComponentKeys = Object.assign([], newState.componentKeys);
    newState.disclosureComponentData = Object.assign({}, newState.components);

    return newState;
  }

  openDisclosure(data) {
    this.setState({
      disclosureIsOpen: true,
      disclosureSize: data.size || 'small',
      disclosureComponentKeys: [data.content.key],
      disclosureComponentData: {
        [data.content.key]: {
          key: data.content.key,
          name: data.content.name,
          props: data.content.props,
        },
      },
    });
  }

  pushDisclosure(data) {
    const newState = this.cloneDisclosureState(this.state);

    newState.disclosureComponentKeys.push(data.content.key);
    newState.disclosureComponentData[data.content.key] = {
      name: data.content.name,
      props: data.content.props,
      key: data.content.key,
    };
  }

  popDisclosure() {
    const newState = this.cloneDisclosureState(this.state);

    newState.components[newState.componentKeys.pop()] = undefined;

    return newState;
  }

  closeDisclosure() {
    this.setState({
      disclosureIsOpen: false,
      disclosureSize: false,
      disclosureComponentKeys: undefined,
      disclosureComponentData: undefined,
    });
  }

  generateChildAppDelegate() {
    const { app, supportedDisclosureTypes } = this.props;

    return AppDelegate.clone(app, {
      disclose: (data) => {
        if (supportedDisclosureTypes.indexOf(data.preferredType) >= 0 || !app) {
          this.openDisclosure(data);
          this.dismissMap[data.key] = new Promise();

          return Promise.resolve(this.dismissMap[data.key]);
        }
        return app.disclose(data);
      },
      registerLock: (lock) => {
        // TODO: Come back to this and think about how to keep this correct after different child mount.
        this.childLock = lock;

        if (app && app.registerLock) {
          return app.registerLock(lock);
        }

        return Promise.resolve();
      },
    });
  }

  renderChildren() {
    const { children } = this.props;

    return React.Children.map(children, child => React.cloneElement(child, {
      app: this.generateChildAppDelegate(),
    }));
  }

  buildDisclosureComponents() {
    const { app, supportedDisclosureTypes } = this.props;
    const { disclosureComponentKeys, disclosureComponentData } = this.state;

    return disclosureComponentKeys.map((componentKey, index) => {
      const componentData = disclosureComponentData[componentKey];
      const ComponentClass = AppDelegate.getComponentForDisclosure(componentData.name);

      if (!ComponentClass) {
        return undefined;
      }

      const appDelegate = AppDelegate.create({
        disclose: (data) => {
          if (supportedDisclosureTypes.indexOf(data.preferredType) >= 0 || !app) {
            this.pushDisclosure(data);
            this.dismissMap[componentData.key] = new Promise();

            return Promise.resolve(this.dismissMap[componentData.key]);
          }
          return app.disclose(data);
        },
        dismiss: (index > 0 ?
          (data) => {
            const lockForDisclosure = this.disclosureLocks[componentData.key];
            if (lockForDisclosure) {
              return lockForDisclosure()
                .then(() => {
                  this.disclosureLocks[componentData.key] = undefined;
                  this.popDisclosure(data);
                  this.dismissMap[componentData.key].resolve(data);
                });
            }
            return Promise.resolve().then(() => {
              this.popDisclosure(data);
              this.dismissMap[componentData.key].resolve(data);
            });
          } :
          () => {
            this.closeDisclosure();

            return Promise.resolve();
          }
        ),
        closeDisclosure: () => {
          this.closeDisclosure();

          return Promise.resolve();
        },
        goBack: (index > 0 ?
          (data) => {
            const lockForDisclosure = this.disclosureLocks[componentData.key];
            if (lockForDisclosure) {
              return lockForDisclosure()
                .then(() => {
                  this.disclosureLocks[componentData.key] = undefined;
                  this.popDisclosure(data);
                  this.dismissMap[componentData.key].resolve(data);
                });
            }
            return Promise.resolve().then(() => {
              this.popDisclosure(data);
              this.dismissMap[componentData.key].resolve(data);
            });
          } :
          null
        ),
        registerLock: (lockPromise) => {
          this.disclosureLocks[componentData.key] = lockPromise;

          if (app && app.registerLock) {
            // The combination of all managed promise locks is registered to the parent app delegate to ensure
            // that all are accounted for.
            return app.registerLock(Promise.all(Object.values(this.disclosureLocks)));
          }

          return Promise.resolve();
        },
      });

      return <ComponentClass key={componentData.key} {...componentData.props} app={appDelegate} />;
    });
  }

  render() {
    const { disclosureIsOpen, disclosureSize } = this.state;

    const renderedChildren = this.renderChildren();

    const generatedDisclosureComponents = this.buildDisclosureComponents();

    if (this.props.render) {
      return this.props.render(renderedChildren, {
        isOpen: disclosureIsOpen,
        size: disclosureSize,
        components: generatedDisclosureComponents,
      });
    }

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

DisclosureManager.propTypes = propTypes;

export default DisclosureManager;
