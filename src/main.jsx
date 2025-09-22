import React from 'react';
import ReactDOM from 'react-dom/client';

import './style/main.scss';
import Routes from './routes/Routes';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Routes />
    <Toaster position="top-right" />
  </React.StrictMode>,
);
