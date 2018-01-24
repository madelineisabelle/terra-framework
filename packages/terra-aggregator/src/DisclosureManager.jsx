import React from 'react';
import PropTypes from 'prop-types';
import AppDelegate from 'terra-app-delegate';

const propTypes = {
  app: AppDelegate.propType,
  children: PropTypes.node,
  supportedDisclosureTypes: PropTypes.array,

  render: PropTypes.func,
};

const defaultProps = {
  supportedDisclosureTypes: [],
};

class DisclosureManager extends React.Component {
  constructor(props) {
    super(props);

    this.getLockPromises = this.getLockPromises.bind(this);
    this.renderChildren = this.renderChildren.bind(this);
    this.generateChildAppDelegate = this.generateChildAppDelegate.bind(this);

    this.openDisclosure = this.openDisclosure.bind(this);
    this.pushDisclosure = this.pushDisclosure.bind(this);
    this.popDisclosure = this.popDisclosure.bind(this);
    this.closeDisclosure = this.closeDisclosure.bind(this);

    // We don't need to keep these in state; doing so may trigger unnecessary renders.
    this.disclosureLocks = {};
    this.dismissMap = {};
    this.childLock = undefined;

    this.state = {
      disclosureIsOpen: false,
      disclosureSize: 'small',
      disclosureComponentKeys: [],
      disclosureComponentData: {},
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
    newState.disclosureComponentKeys = Object.assign([], newState.disclosureComponentKeys);
    newState.disclosureComponentData = Object.assign({}, newState.disclosureComponentData);

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

    this.setState(newState);
  }

  popDisclosure() {
    const newState = this.cloneDisclosureState(this.state);

    newState.disclosureComponentData[newState.disclosureComponentKeys.pop()] = undefined;

    this.setState(newState);
  }

  closeDisclosure() {
    this.setState({
      disclosureIsOpen: false,
      disclosureSize: 'small',
      disclosureComponentKeys: [],
      disclosureComponentData: {},
    });
  }

  generateChildAppDelegate() {
    const { app, supportedDisclosureTypes } = this.props;

    return AppDelegate.clone(app, {
      disclose: (data) => {
        if (supportedDisclosureTypes.indexOf(data.preferredType) >= 0 || !app) {
          this.openDisclosure(data);

          return Promise.resolve({
            onDismiss: new Promise((resolve) => {
              this.dismissMap[data.content.key] = resolve;
              debugger;
            }),
            forceDismiss: () => {
              const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key]());
              if (locksForDisclosures.length) {
                return Promise.all(locksForDisclosures)
                  .then(() => {
                    this.disclosureLocks = {};
                    this.state.disclosureComponentKeys.forEach((key) => {
                      this.dismissMap[key]();
                    });

                    this.closeDisclosure();
                  })
                  .then(() => {
                    this.dismissMap = {};
                  });
              }

              this.disclosureLocks = {};
              return Promise.resolve()
                .then(() => {
                  this.state.disclosureComponentKeys.forEach((key) => {
                    this.dismissMap[key]();
                  });
                  this.closeDisclosure();
                });
            },
          });
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

            return Promise.resolve({
              onDismiss: new Promise((resolve) => {
                this.dismissMap[data.content.key] = resolve;
              }),
            });
          }
          return app.disclose(data);
        },
        dismiss: (index > 0 ?
          (data) => {
            debugger;
            const lockForDisclosure = this.disclosureLocks[componentData.key];
            if (lockForDisclosure) {
              return lockForDisclosure()
                .then(() => {
                  this.disclosureLocks[componentData.key] = undefined;
                  this.dismissMap[componentData.key](data);
                  this.popDisclosure(data);
                });
            }
            return Promise.resolve().then(() => {
              this.dismissMap[componentData.key](data);
              this.popDisclosure(data);
            });
          } :
          () => {
            debugger;
            const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key]());
            if (locksForDisclosures.length) {
              return Promise.all(locksForDisclosures)
                .then(() => {
                  this.disclosureLocks = {};
                  this.state.disclosureComponentKeys.forEach((key) => {
                    this.dismissMap[key]();
                  });

                  this.closeDisclosure();
                })
                .then(() => {
                  this.dismissMap = {};
                });
            }

            this.disclosureLocks = {};
            return Promise.resolve()
              .then(() => {
                this.state.disclosureComponentKeys.forEach((key) => {
                  this.dismissMap[key]();
                });
                this.closeDisclosure();
              });
          }
        ),
        closeDisclosure: () => {
          const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key]());
          if (locksForDisclosures.length) {
            return Promise.all(locksForDisclosures)
              .then(() => {
                this.disclosureLocks = {};
                this.state.disclosureComponentKeys.forEach((key) => {
                  this.dismissMap[key]();
                });

                this.closeDisclosure();
              })
              .then(() => {
                this.dismissMap = {};
              });
          }

          this.disclosureLocks = {};
          return Promise.resolve()
            .then(() => {
              this.state.disclosureComponentKeys.forEach((key) => {
                this.dismissMap[key]();
              });
              this.closeDisclosure();
            });
        },
        goBack: (index > 0 ?
          (data) => {
            const lockForDisclosure = this.disclosureLocks[componentData.key];
            if (lockForDisclosure) {
              return lockForDisclosure()
                .then(() => {
                  this.disclosureLocks[componentData.key] = undefined;
                  this.dismissMap[componentData.key](data);
                  this.popDisclosure(data);
                });
            }
            return Promise.resolve().then(() => {
              this.dismissMap[componentData.key](data);
              this.popDisclosure(data);
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

    if (!this.props.render) {
      return null;
    }

    return this.props.render(renderedChildren, {
      isOpen: disclosureIsOpen,
      size: disclosureSize,
      components: generatedDisclosureComponents,
    });
  }
}

DisclosureManager.propTypes = propTypes;
DisclosureManager.defaultProps = defaultProps;

export default DisclosureManager;
