import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Commessa } from 'types';

import Layout from '@components/_layout';

export const Commesse: React.FC = () => {
    const [commesse] = useState<Commessa[]>(JSON.parse(sessionStorage.getItem('commesse') ?? '[]'));

    return (
        <Layout title="Commesse">
            <h1>Commesse</h1>

            <div className="mt-8 text-xl">
                <Link to="/commesse/manage">Aggiungi commessa + </Link>
            </div>

            {commesse?.map(c => (
                <div key={c.id} className="mt-4 p-4">
                    <Link to={`/commesse/manage/${c.id}`}>
                        {c.id}: {c.title}
                    </Link>
                </div>
            ))}
        </Layout>
    );
};
