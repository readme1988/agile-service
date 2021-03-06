import React, { createContext, useMemo, useState } from 'react';
import { StoreProvider } from './stores';
import StateList from './StateList';

export default function Index(props) {
  return (
    <StoreProvider {...props}>
      <StateList />
    </StoreProvider>
  );
}
