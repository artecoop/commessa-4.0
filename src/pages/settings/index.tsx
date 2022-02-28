import Layout from '@components/_layout';

import { FieldsView } from './fields';
import { ProcessingsView } from './processings';

export const Settings: React.FC = () => {
    return (
        <Layout title="Impostazioni">
            <h1>Impostazioni</h1>

            <div className="flex">
                <div className="flex-1 bg-blue-100 p-2">
                    <FieldsView />
                </div>
                <div className="flex-1 bg-slate-100 p-2">
                    <ProcessingsView />
                </div>
            </div>
        </Layout>
    );
};
