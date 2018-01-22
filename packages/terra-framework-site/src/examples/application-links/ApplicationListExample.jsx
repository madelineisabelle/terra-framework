import React from 'react';
import { ApplicationList } from 'terra-application-links';
import ApplicationLinkConfig from './ApplicationLinkConfig';

const ApplicationListExample = () => (
  <div style={{ border: '1px solid lightGray', width: '100%' }}>
    <ApplicationList
      links={ApplicationLinkConfig}
    />
  </div>
);

export default ApplicationListExample;
