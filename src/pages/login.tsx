import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import { error } from '@lib/notification';

import { useAuth } from '../contexts/auth';

import { Button, Center, Group, PasswordInput, TextInput, Title } from '@mantine/core';

type Form = {
    username: string;
    password: string;
};

const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const {
        handleSubmit,
        register,
        formState: { errors }
    } = useForm<Form>();

    const returnUrl = searchParams.get('returnUrl') ?? '/commesse';

    const onSubmit = async (values: Form) => {
        try {
            await login?.(values.username, values.password);
            navigate(returnUrl);
        } catch (e) {
            error(e);
        }
    };

    return (
        <Center style={{ height: '100vh' }} p="xs">
            <div>
                <Group mb="xl" position="center">
                    <img src="/assets/logo.png" alt="Art&amp;Coop" title="Art&amp;Coop" style={{ width: '80px' }} />
                    <Title order={1} ml="md">
                        Art&amp;Coop Commessa
                    </Title>
                </Group>

                <form noValidate onSubmit={handleSubmit(onSubmit)}>
                    <TextInput
                        label="Username"
                        size="xl"
                        required
                        variant="filled"
                        defaultValue="valerio.fornito@artecoop.it"
                        {...register('username', { required: 'Lo username è obbligatorio' })}
                        error={errors.username?.message}
                    />

                    <PasswordInput
                        label="Password"
                        size="xl"
                        required
                        variant="filled"
                        defaultValue="u2xE[2v66Rm~icZ9X5ILFEi!"
                        {...register('password', { required: 'La password è obbligatoria' })}
                        error={errors.password?.message}
                        className="mt-4"
                    />

                    <Button type="submit" size="xl" uppercase variant="outline" className="mt-6 w-full">
                        Accedi
                    </Button>
                </form>
            </div>
        </Center>
    );
};

export default Login;
