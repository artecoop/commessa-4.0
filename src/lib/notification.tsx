import { ReactNode } from 'react';

import { DefaultMantineColor } from '@mantine/core';
import { showNotification } from '@mantine/notifications';

import { CheckIcon, ExclamationIcon, InformationCircleIcon } from '@heroicons/react/outline';

const error = (e: unknown) => {
    let message = 'Si è verificato un errore sconosciuto';

    if (typeof e === 'string') {
        message = e;
    }

    if (e instanceof Error) {
        message = e.message;
    }

    show('Attenzione', message, 'red', <ExclamationIcon width={18} height={18} />);
};

const success = (message: string) => {
    show('Successo', message, 'green', <CheckIcon width={18} height={18} />);
};

const info = (message: string) => {
    show('Info', message, 'yellow', <InformationCircleIcon width={18} height={18} />);
};

const show = (title: string, message: string, color: DefaultMantineColor, icon: ReactNode) => {
    showNotification({
        title,
        message,
        icon,
        color,
        styles: theme => ({
            root: {
                backgroundColor: theme.colors.dark[4],
                borderColor: theme.colors.dark[4],

                '&::before': { backgroundColor: theme.colors[color] }
            },

            title: { color: theme.white },
            description: { color: theme.white, fontSize: '1.2em' },
            closeButton: {
                color: theme.colors[color],
                '&:hover': { backgroundColor: theme.colors[color], color: theme.white }
            }
        })
    });
};

export { error, success, info };
