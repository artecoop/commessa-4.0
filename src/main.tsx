import { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import App from './App';

import './styles/global.css';

import { Field, FieldType, Processing } from './types';

const fields: Field[] = [
    { id: 1, fieldName: 'Tipo Carta', fieldType: FieldType.TEXT },
    { id: 2, fieldName: 'Verniciatura', fieldType: FieldType.BOOLEAN },
    { id: 3, fieldName: 'Colori', fieldType: FieldType.NUMBER },
    { id: 4, fieldName: 'Formato', fieldType: FieldType.TEXT },
    { id: 5, fieldName: 'Grammatura', fieldType: FieldType.NUMBER }
];

sessionStorage.setItem('fields', JSON.stringify(fields));

const processings: Processing[] = [
    { id: 1, name: 'Stampa' },
    { id: 2, name: 'Taglio' },
    { id: 3, name: 'Brossura' },
    { id: 4, name: 'Plastifica' }
];

sessionStorage.setItem('processings', JSON.stringify(processings));

ReactDOM.render(
    <StrictMode>
        <App />
    </StrictMode>,
    document.getElementById('root')
);
