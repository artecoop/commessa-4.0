import Layout from '@components/_layout';
import { Title } from '@mantine/core';

const Home: React.FC = () => {
    return (
        <Layout title="Benvenuti">
            <Title order={1}>Benvenuti</Title>
        </Layout>
    );
};

export default Home;
