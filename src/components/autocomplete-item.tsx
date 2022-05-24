import { forwardRef } from 'react';
import { SelectItemProps, Text } from '@mantine/core';

interface ItemProps extends SelectItemProps {
    label: string;
}

// eslint-disable-next-line react/display-name
const AutoCompleteItem = forwardRef<HTMLDivElement, ItemProps>(({ label, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
        <Text size="lg">{label}</Text>
    </div>
));

export default AutoCompleteItem;
