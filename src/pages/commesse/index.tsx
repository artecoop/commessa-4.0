import Layout from '@components/_layout';
import { Link } from 'react-router-dom';

export const Commesse: React.FC = () => {
    return (
        <Layout title="Commesse">
            <h1>Commesse</h1>

            <div className="mt-8 text-xl">
                <Link to="/commesse/manage">Aggiungi commessa + </Link>
            </div>
        </Layout>
    );
};
