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
  static cloneDisclosureState(state) {
    const newState = Object.assign({}, state);
    newState.disclosureComponentKeys = Object.assign([], newState.disclosureComponentKeys);
    newState.disclosureComponentData = Object.assign({}, newState.disclosureComponentData);

    return newState;
  }

  constructor(props) {
    super(props);

    this.getLockPromises = this.getLockPromises.bind(this);
    this.renderContentComponents = this.renderContentComponents.bind(this);
    this.renderDisclosureComponents = this.renderDisclosureComponents.bind(this);

    this.generateChildAppDelegate = this.generateChildAppDelegate.bind(this);

    this.openDisclosure = this.openDisclosure.bind(this);
    this.pushDisclosure = this.pushDisclosure.bind(this);
    this.popDisclosure = this.popDisclosure.bind(this);
    this.closeDisclosure = this.closeDisclosure.bind(this);
    this.requestDisclosureFocus = this.requestDisclosureFocus.bind(this);
    this.releaseDisclosureFocus = this.releaseDisclosureFocus.bind(this);

    this.safelyCloseDisclosure = this.safelyCloseDisclosure.bind(this);

    // We don't need to keep these in state; doing so may trigger unnecessary renders.
    this.disclosureLocks = {};
    this.dismissMap = {};
    this.childLock = undefined;

    this.state = {
      disclosureIsOpen: false,
      disclosureIsFocused: true,
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
    const newState = DisclosureManager.cloneDisclosureState(this.state);

    newState.disclosureComponentKeys.push(data.content.key);
    newState.disclosureComponentData[data.content.key] = {
      name: data.content.name,
      props: data.content.props,
      key: data.content.key,
    };

    this.setState(newState);
  }

  popDisclosure() {
    const newState = DisclosureManager.cloneDisclosureState(this.state);

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

  requestDisclosureFocus() {
    this.setState({
      disclosureIsFocused: true,
    });
  }

  releaseDisclosureFocus() {
    this.setState({
      disclosureIsFocused: false,
    });
  }

  generateChildAppDelegate() {
    const { app, supportedDisclosureTypes } = this.props;

    return AppDelegate.clone(app, {
      disclose: (data) => {
        if (supportedDisclosureTypes.indexOf(data.preferredType) >= 0 || !app) {
          return this.safelyCloseDisclosure()
            .then(() => {
              this.openDisclosure(data);

              return {
                onDismiss: new Promise((resolve) => {
                  this.dismissMap[data.content.key] = resolve;
                }),
                forceDismiss: () => {
                  const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key] && this.disclosureLocks[key]());
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
              };
            });
        }
        return app.disclose(data);
      },
      registerLock: (lock) => {
        // This might be a problem if we want to support more than one child. We don't have a good way of storing
        // multiple child locks without registering some sort of key.
        this.childLock = lock;

        if (app && app.registerLock) {
          return app.registerLock(lock);
        }

        return Promise.resolve();
      },
    });
  }

  safelyCloseDisclosure() {
    const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key] && this.disclosureLocks[key]());
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

  renderContentComponents() {
    const { children } = this.props;

    return React.Children.map(children, child => React.cloneElement(child, {
      app: this.generateChildAppDelegate(),
    }));
  }

  renderDisclosureComponents() {
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
            const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key] && this.disclosureLocks[key]());
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
          const locksForDisclosures = this.state.disclosureComponentKeys.map(key => this.disclosureLocks[key] && this.disclosureLocks[key]());
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
            // that all are accounted for by the parent.
            return app.registerLock(Promise.all(Object.values(this.disclosureLocks)));
          }

          return Promise.resolve();
        },
        requestFocus: () => Promise.resolve().then(() => { this.requestDisclosureFocus(); }),
        releaseFocus: () => Promise.resolve().then(() => { this.releaseDisclosureFocus(); }),
      });

      return <ComponentClass key={componentData.key} {...componentData.props} app={appDelegate} />;
    });
  }

  render() {
    const { render } = this.props;
    const { disclosureIsOpen, disclosureIsFocused, disclosureSize } = this.state;

    if (!render) {
      return null;
    }

    return render({
      closeDisclosure: this.safelyCloseDisclosure,
      content: {
        components: this.renderContentComponents(),
      },
      disclosure: {
        isOpen: disclosureIsOpen,
        isFocused: disclosureIsFocused,
        size: disclosureSize,
        components: this.renderDisclosureComponents(),
      },
    });
  }
}

DisclosureManager.propTypes = propTypes;
DisclosureManager.defaultProps = defaultProps;

export default DisclosureManager;
