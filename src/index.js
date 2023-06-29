import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AnkiPage from './app';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <AnkiPage />
    </React.StrictMode>
);