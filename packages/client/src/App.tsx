
// File: packages/client/src/App.tsx

import HomePage from "./pages/HomePage";
import UserPage from "./pages/UserPage";


function App() {
    return (
        <div className="App">
            <header className="App-header">
                <h1>My Application</h1>
            </header>

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