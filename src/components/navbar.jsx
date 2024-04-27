
import { Container } from 'react-bootstrap';
import Navbar from 'react-bootstrap/Navbar';

function Navigation() {
  return (
    <Navbar collapseOnSelect expand="lg" bg="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand href="#home">Cafébara</Navbar.Brand>
      </Container>
    </Navbar>
  );
}

export default Navigation;
