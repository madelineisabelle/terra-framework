import React from 'react';
import PropTypes from 'prop-types';
import SlidePanel from 'terra-slide-panel';
import AppDelegate from 'terra-app-delegate';
import SlideGroup from 'terra-slide-group';

const propTypes = {
  app: AppDelegate.propType,
  children: PropTypes.node,

  openDisclosure: PropTypes.func,
  pushDisclosure: PropTypes.func,
  popDisclosure: PropTypes.func,

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
  }

  getLockPromises() {
    const lockPromises = [];

    if (this.disclosureLocks) {
      lockPromises.push(Promise.all(Object.values(this.disclosureLocks).map(lock => lock && lock())));
    }

    return lockPromises;
  }

  generateChildAppDelegate() {
    const { app, openDisclosure } = this.props;

    return AppDelegate.clone(app, {
      disclose: (data) => {
        if (this.props.supportedDisclosureTypes.indexOf(data.preferredType) >= 0 || !app) {
          openDisclosure(data);
          this.dismissMap[data.key] = new Promise();

          return Promise.resolve(this.dismissMap[data.key]);
        }
        return app.disclose(data);
      },
      registerLock: (lock) => {
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
    const { app, disclosureComponentData, pushDisclosure, popDisclosure } = this.props;

    return disclosureComponentData.map((componentData, index) => {
      const ComponentClass = AppDelegate.getComponentForDisclosure(componentData.name);

      if (!ComponentClass) {
        return undefined;
      }

      const appDelegate = AppDelegate.create({
        disclose: (data) => {
          if (this.props.supportedDisclosureTypes.indexOf(data.preferredType) >= 0 || !app) {
            pushDisclosure(data);
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
                  popDisclosure(data);
                  this.dismissMap[componentData.key].resolve(data);
                });
            }
            return Promise.resolve().then(() => {
              popDisclosure(data);
              this.dismissMap[componentData.key].resolve(data);
            });
          } :
          () => this.props.closeDisclosure()
        ),
        closeDisclosure: () => this.props.closeDisclosure(),
        goBack: (index > 0 ?
          (data) => {
            const lockForDisclosure = this.disclosureLocks[componentData.key];
            if (lockForDisclosure) {
              return lockForDisclosure()
                .then(() => {
                  this.disclosureLocks[componentData.key] = undefined;
                  popDisclosure(data);
                  this.dismissMap[componentData.key].resolve(data);
                });
            }
            return Promise.resolve().then(() => {
              popDisclosure(data);
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
    const { disclosureIsOpen, disclosureSize } = this.props;

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
