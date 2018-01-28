import React from 'react';
import DisclosureManager from '../../src/DisclosureManager';

describe('DisclosureManager', () => {
  const defaultRender = <DisclosureManager />;

  // Snapshot Tests
  it('should render a default component', () => {
    const wrapper = shallow(defaultRender);
    expect(wrapper).toMatchSnapshot();
  });

  // Prop Tests
  it('should use the default value when no value is given', () => {
    const wrapper = shallow(defaultRender);
    expect(wrapper.find('.disclosure-manager').text()).toEqual('defualt');
  });

  // Structure Tests
  it('should have the class disclosure-manager', () => {
    const wrapper = shallow(defaultRender);
    expect(wrapper.prop('className')).toContain('disclosure-manager');
  });
});
