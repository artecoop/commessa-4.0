import { Component, ComponentProps, ReactNode } from 'react';

import { ExclamationCircleIcon } from '@heroicons/react/outline';
import { HTTPError } from 'types';

class ErrorBoundary extends Component<ComponentProps<'div'>, { error?: Error }> {
    state: { error?: Error } = {};

    componentDidCatch(error: Error): void {
        this.setState({
            error: error
        });
    }

    render(): ReactNode {
        if (!this.state.error) {
            return this.props.children;
        }

        if (this.state.error instanceof HTTPError && [401, 403].includes(this.state.error.code)) {
            window.location.replace(`/login?returnUrl=${window.location.pathname}`);
            return <></>;
        }

        return (
            <div className="flex flex-col items-center justify-center" style={{ height: '100vh' }}>
                <div className="flex items-center" style={{ color: 'red' }}>
                    <ExclamationCircleIcon style={{ width: '3em', height: '3em', color: 'red' }} />
                    <h3 className="ml-1">Si è verificato un errore nel caricare i dati</h3>
                </div>

                <h5 className="mt-4">{this.state.error?.message}</h5>
            </div>
        );
    }
}

export default ErrorBoundary;
