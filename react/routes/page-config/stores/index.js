import React, { createContext, useState } from 'react';
import { inject } from 'mobx-react';
import { injectIntl } from 'react-intl';

const PageConfigContext = createContext();
export default PageConfigContext;

export const PageConfigProvider = injectIntl(inject('AppState')(
  (props) => {
    const [reLoad, setReLoad] = useState(false);
    const [pageDetailItem, setPageDetailItem] = useState({});
    const [pageDetailVisible, setPageDetailVisible] = useState(false);
    const [objectDetailItem, setObjectDetailItem] = useState({
      schemeCode: 'agile_issue',
    });
    const [addObVisible, setAddObVisible] = useState(true);
    const value = {
      pageDetailItem,
      setPageDetailItem,
      pageDetailVisible,
      setPageDetailVisible,
      objectDetailItem,
      setObjectDetailItem,
      addObVisible,
      setAddObVisible,
      reLoad,
      setReLoad,
    };
    return (
      <PageConfigContext.Provider value={value}>
        {props.children}
      </PageConfigContext.Provider>
    );
  },
));
