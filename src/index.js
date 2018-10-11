import React from 'react';
import ReactDOM from 'react-dom';
import './assets/jquery/include';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
