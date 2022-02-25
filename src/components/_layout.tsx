import { PropsWithChildren, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Props = {
    title?: string;
};

const Layout: React.FC<Props> = ({ title, children }: PropsWithChildren<Props>) => {
    useEffect(() => {
        document.title = `${title} - Art&Coop Commessa`;
    });

    return (
        <div className="mx-auto flex h-full w-2/3 flex-col">
            <nav className="border-b-2 border-gray-700">
                <ul className="flex h-full">
                    <li>
                        <Link to="/" className="flex flex-col items-center px-6 py-4">
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link to="/commesse" className="flex flex-col items-center px-6 py-4">
                            Commesse
                        </Link>
                    </li>
                    <li>
                        <Link to="/settings" className="flex flex-col items-center px-6 py-4">
                            Impostazioni
                        </Link>
                    </li>
                    <li className="flex-1"></li>
                </ul>
            </nav>

            <main className="mt-4 flex-1">{children}</main>

            <footer className="mt-8 border-t-2 py-4">
                <div className="py-2">© {new Date().getFullYear()} Art&amp;Coop Società Cooperativa. - Non condividere queste pagine con nessuno!</div>
            </footer>
        </div>
    );
};

export default Layout;
