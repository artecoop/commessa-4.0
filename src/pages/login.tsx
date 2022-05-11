import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { showNotification } from '@mantine/notifications';

import { useAuth } from '../contexts/auth';

import { Button, PasswordInput, TextInput } from '@mantine/core';

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

    const returnUrl = searchParams.get('returnUrl') ?? '/';

    const onSubmit = async (values: Form) => {
        try {
            await login?.(values.username, values.password);
            navigate(returnUrl);
        } catch (e) {
            const error = e as Error;
            showNotification({ message: error.message, color: 'red' });
        }
    };

    return (
        <section>
            <div>
                <div>
                    <span>Accedi</span>
                </div>
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
        </section>
    );
};

export default Login;
