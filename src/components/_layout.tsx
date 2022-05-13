import { PropsWithChildren, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppShell, Navbar, Header, Burger, Footer, MediaQuery, Text, Image, Title, Group, ThemeIcon, UnstyledButton } from '@mantine/core';
import { CubeTransparentIcon, HomeIcon, PaperAirplaneIcon } from '@heroicons/react/outline';

type LayoutProps = {
    title?: string;
};

export const Layout: React.FC<PropsWithChildren<LayoutProps>> = (props: PropsWithChildren<LayoutProps>) => {
    const navigate = useNavigate();

    const [opened, setOpened] = useState(false);

    useEffect(() => {
        document.title = `${props.title} - Art&Coop Commessa`;
    });

    const menu = [
        { icon: <HomeIcon />, color: 'lime', label: 'Home', link: '/' },
        { icon: <CubeTransparentIcon />, color: 'indigo', label: 'Commesse', link: '/commesse' },
        { icon: <PaperAirplaneIcon />, color: 'orange', label: 'Carta', link: '/papers' }
    ];

    return (
        <AppShell
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            fixed
            header={
                <Header height={70} p="md">
                    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                        <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                            <Burger opened={opened} onClick={() => setOpened(o => !o)} size="sm" mr="xl" />
                        </MediaQuery>

                        <Image height={60} radius="md" src="/assets/logo.png" alt="Art&amp;Coop Società Cooperativa" />
                        <Title order={1} ml="xl">
                            Art&amp;Coop Commessa
                        </Title>
                    </div>
                </Header>
            }
            navbar={
                <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
                    {menu.map(m => (
                        <UnstyledButton
                            key={m.label}
                            sx={theme => ({
                                display: 'block',
                                width: '100%',
                                padding: theme.spacing.xs,
                                borderRadius: theme.radius.sm
                            })}
                            onClick={() => navigate(m.link)}
                        >
                            <Group>
                                <ThemeIcon color={m.color} variant="light">
                                    {m.icon}
                                </ThemeIcon>

                                <Text size="sm">{m.label}</Text>
                            </Group>
                        </UnstyledButton>
                    ))}
                </Navbar>
            }
            footer={
                <Footer height={60} p="md">
                    © {new Date().getFullYear()} Art&amp;Coop Società Cooperativa. - Non condividere queste pagine con nessuno!
                </Footer>
            }
        >
            {props.children}
        </AppShell>
    );
};

export default Layout;
