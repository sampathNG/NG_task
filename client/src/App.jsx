import FolderList from "./components/FolderList";
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FolderList />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
