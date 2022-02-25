import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import { Home } from './pages/home';
import { Settings } from './pages/settings';
import { Commesse } from './pages/commesse';
import { ManageCommessa } from './pages/commesse/manage';

export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route index element={<Home />} />
                    <Route path="/commesse">
                        <Route index element={<Commesse />} />
                        <Route path="manage" element={<ManageCommessa />} />
                        <Route path="manage/:id" element={<ManageCommessa />} />
                    </Route>
                    <Route path="/settings">
                        <Route index element={<Settings />} />
                    </Route>
                </Routes>
            </Router>

            <ToastContainer
                key="ToastContainer"
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                closeButton={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                draggable
                pauseOnHover={false}
                theme="colored"
            />
        </>
    );
}
