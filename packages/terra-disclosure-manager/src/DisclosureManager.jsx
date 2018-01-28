import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import 'terra-base/lib/baseStyles';
import styles from './DisclosureManager.scss';

const cx = classNames.bind(styles);

const propTypes = {
 /*
 * Content to be displayed as the name
 */
  name: PropTypes.string,
};

const defaultProps = {
  name: 'default',
};

const DisclosureManager = ({ name, ...customProps }) => {
  const attributes = Object.assign({}, customProps);
  const DisclosureManagerClassNames = cx([
    'disclosure-manager',
    attributes.className,
  ]);

  return (<div {...attributes} className={DisclosureManagerClassNames} />);
};

DisclosureManager.propTypes = propTypes;
DisclosureManager.defaultProps = defaultProps;

export default DisclosureManager;
