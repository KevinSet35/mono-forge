
// File: packages/client/src/App.tsx

import HomePage from "./pages/HomePage";


function App() {
    return (
        <div className="App">

            <main>
                <HomePage />
            </main>

            <footer>
                <p>&copy; {new Date().getFullYear()} My Company</p>
            </footer>
        </div>
    );
}

export default App;