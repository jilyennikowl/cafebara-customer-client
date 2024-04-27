import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/product.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import ProductList from './pages/product-list';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ProductList />} />
      </Routes>
    </Router>
  );
}

export default App;
