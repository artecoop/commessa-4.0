const processings = [
    { value: 'design', label: 'Grafica' },
    { value: 'prepress', label: 'Prestampa' },
    { value: 'plastifica', label: 'Plastifica' },
    { value: 'folding', label: 'Piega' },
    { value: 'collection', label: 'Raccolta' },
    { value: 'filorefe', label: 'Filo refe' },
    { value: 'binding', label: 'Brossura' },
    { value: 'cut', label: 'Taglio' }
];

const offsetRunTypes = [
    { value: 'b', label: 'Bianca' },
    { value: 'v', label: 'Volta' },
    { value: 'bv12', label: 'B/V Giro 12' },
    { value: 'bv16', label: 'B/V Giro 16' }
];

const digitalRunTypes = [
    { value: 'single', label: 'Fronte' },
    { value: 'duplex', label: 'Fronte + Retro' }
];

const varnishTypes = [
    { value: 'fulltable', label: 'Tavola piena' },
    { value: 'reserve', label: 'Riserva' }
];

export { processings, offsetRunTypes, digitalRunTypes, varnishTypes };
