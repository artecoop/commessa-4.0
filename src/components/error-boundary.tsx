import { Component, ComponentProps, ReactNode } from 'react';

import { Box, Title } from '@mantine/core';

import { ExclamationCircleIcon } from '@heroicons/react/outline';

class ErrorBoundary extends Component<ComponentProps<'div'>, { error?: Error }> {
    state: { error?: Error } = {};

    componentDidCatch(error: Error): void {
        this.setState({
            error: error
        });
    }

    render(): ReactNode {
        console.log(this.state.error);
        if (!this.state.error) {
            return this.props.children;
        }

        return (
            <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Box sx={{ color: 'red', display: 'flex', alignItems: 'center' }}>
                    <ExclamationCircleIcon style={{ width: '3em', height: '3em', color: 'red' }} />
                    <Title order={3} ml="xs">
                        Si è verificato un errore nel caricare i dati
                    </Title>
                </Box>

                <Title order={5} mt="lg">
                    {this.state.error?.message}
                </Title>
            </Box>
        );
    }
}

export default ErrorBoundary;
