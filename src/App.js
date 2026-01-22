import { jsx as _jsx } from "react/jsx-runtime";
import AppLayout from "./app/AppLayout";
import Home from "./pages/Home";
function App() {
    return (_jsx(AppLayout, { children: _jsx(Home, {}) }));
}
export default App;
