import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'terra-modal';
import AppDelegate from 'terra-app-delegate';
import SlideGroup from 'terra-slide-group';
import DisclosureManager from './DisclosureManager';

const propTypes = {
  app: AppDelegate.propType,
  children: PropTypes.node,
};

class NewModalManager extends React.Component {
  static renderSlidePanel(children, disclosureData) {
    return (
      <div style={{ height: '100%' }}>
        {children}
        <Modal
          isFocused={false}
          isOpen={disclosureData.isOpen}
          isFullscreen={false}
          // classNameModal={modalClasses}
          // onRequestClose={closeModal}
          closeOnEsc
          closeOnOutsideClick={false}
          ariaLabel="Modal"
        >
          <SlideGroup items={disclosureData.components} isAnimated />
        </Modal>
      </div>
    );
  }

  render() {
    return (
      <DisclosureManager
        app={this.props.app}
        supportedDisclosureTypes={['modal']}
        render={NewModalManager.renderSlidePanel}
      >
        {this.props.children}
      </DisclosureManager>
    );
  }
}

NewModalManager.propTypes = propTypes;

export default NewModalManager;
