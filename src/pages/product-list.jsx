
import { useState, useEffect } from "react";
import { CartFill, CartPlusFill, CartDashFill, ExclamationCircleFill, Search } from "react-bootstrap-icons";
import Navigation from "../components/navbar";
import { Container, Row, Col, Card, Button, Badge, ToastContainer, Toast, InputGroup, Form, Modal } from "react-bootstrap";
import axios from "axios";
import Checkout from "../components/checkout";

function ProductList() {
  const [baseProducts, setBaseProducts] = useState([])
  const [products, setProducts] = useState([])
  const [addedToCart, setAddedToCart] = useState(0)
  const [productsAddedToCart, setProductsAddedToCart] = useState([])
  const [checkoutShown, setCheckoutShown] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [search, setSearch] = useState('')

  const [showI, setShowI] = useState(false);
  const [showIProduct, setShowIProduct] = useState(null)
  const handleCloseI = () => {
    setShowIProduct(null)
    setShowI(false)
  }
  const handleShowI = (p) => {
    setShowIProduct(p)
    setShowI(true)
  }
  
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_HOST}/public/products`, {
      headers: {
        access_token: localStorage.getItem('access_token'),
      }})
      .then((response) => {
        setProducts(response.data)
        setBaseProducts(response.data)
      })
      .catch((error) => {
        console.log(error)
      })
  }, [])

  useEffect(() => {
    setProducts(() => {
      const filtered = baseProducts.filter(({productName, productCode, description}) => {
        const k = new RegExp(search, 'i')
        if (
          k.test(productName) ||
          k.test(productCode) ||
          k.test(description)
        ) {
          return true
        }
        return false
      })
      return filtered
    })
  }, [ search, baseProducts ])

  const decrementItemCount = (product) => {
    setProductsAddedToCart((itemsInCart) => {
      const r = itemsInCart.filter((p) => (p._id !== product._id))
      return r
    })
    setAddedToCart(addedToCart - 1)
  }

  const incrementItemCount = (product) => {
    setProductsAddedToCart((o) => [product, ...o])
    setAddedToCart(addedToCart + 1)
  }

  const showCheckout = () => setCheckoutShown(true);

  return (
    <div className="ProductList">
      <Navigation />
      <Container>
        <div style={{marginTop: '40px'}}>
          <Row>
            <Col xs={12} md={8}>
              <h3 style={{marginBottom: '20px'}}>Products</h3>
            </Col>
            <Col xs={12} md={4}>
              <InputGroup className="mb-3">
                <Form.Control
                  placeholder="Search"
                  aria-label="Search"
                  aria-describedby="basic-addon2"
                  value={search} onChange={e => setSearch(e.target.value)}
                />
                <InputGroup.Text id="basic-addon2">
                  <Search
                    style={{cursor: 'pointer'}}
                    className="text-secondary" size={20} />
                </InputGroup.Text>
              </InputGroup>
            </Col>
          </Row>
        </div>
        {!baseProducts.length ? (<div>
          <h2 className="text-secondary">There is nothing in here</h2>
        </div>) : null}
        {!products.length && baseProducts.length ? (<div>
          <h2 className="text-secondary">Nothing matches your search</h2>
        </div>) : null}
        <Row>
          {products.map((product, i) => (
            <Col xs={12} sm={12} md={6} lg={6} xl={4} key={i} style={{marginBottom: '40px'}}>
              <Container>
                <Card>
                  <Card.Img 
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                      maxHeight: '200px'
                    }}
                    variant="top"
                    src={`${process.env.REACT_APP_API_HOST}/${product.imageUrl}`}
                  />
                  <Card.Body 
                      style={{
                        minHeight: '200px'
                      }}>
                    <Card.Title><h4>{product.productName}</h4></Card.Title>
                    <Card.Text
                      style={{
                        maxHeight: '100px',
                        overflow: 'hidden',
                      }}
                      className="text-secondary">{
                      product.description.length > 100 ? `${product.description.substring(0, 100)}...` : product.description
                    }</Card.Text>
                    <div
                      style={{
                        position:'absolute',
                        bottom: '18px',
                        left: '18px',
                      }}>
                      <Card.Text>PHP {product.price}</Card.Text>
                    </div>
                    <div
                      style={{
                        position:'absolute',
                        bottom: '18px',
                        right: '18px',
                      }}
                    >
                      <ExclamationCircleFill onClick={() => handleShowI(product)} style={{marginRight: '10px', cursor: 'pointer'}} size={25} />
                      {productsAddedToCart.find((p) => p._id === product._id) ? 
                        (<CartDashFill
                          onClick={() => decrementItemCount(product)}
                          style={{cursor: 'pointer', userSelect: 'none'}}
                          className="text-danger"
                          size={25} />)
                        : null}

                      {!productsAddedToCart.find((p) => p._id === product._id) ? 
                        (<CartPlusFill
                          onClick={() => incrementItemCount(product)}
                          style={{cursor: 'pointer', userSelect: 'none'}}
                          className="text-primary"
                          size={25} />)
                        : null}
                    </div>
                  </Card.Body>
                </Card>
              </Container>
            </Col>
          ))}
        </Row>
          {products && productsAddedToCart.length ? (
            <div>
              <Button
                onClick={showCheckout}
                className="cart"
                variant="primary">
                <CartFill style={{cursor: 'pointer'}} className="text-dark" size={35} />&nbsp;
                <Badge bg="light" text="dark">
                  {addedToCart}
                </Badge>
              </Button>
            </div>
          ) : null}
      </Container>
      {checkoutShown ? <Checkout 
        show={checkoutShown} 
        setCheckoutShown={setCheckoutShown} 
        setProductsAddedToCart={setProductsAddedToCart}
        setShowSuccess={setShowSuccess}
        setAddedToCart={setAddedToCart}
        products={productsAddedToCart} /> : null}

      <ToastContainer position='bottom-end' style={{position: 'fixed', padding: '20px'}}>
        <Toast bg="success" onClose={() => setShowSuccess(false)} show={showSuccess} delay={5000} autohide>
          <Toast.Header>
            <strong className="me-auto">Info</strong>
          </Toast.Header>
          <Toast.Body className="text-white">Transaction Completed</Toast.Body>
        </Toast>
      </ToastContainer>

      <Modal centered show={showI} onHide={handleCloseI} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title><span className="text-primary">{showIProduct ? showIProduct.productCode : ''}</span>&nbsp;-&nbsp;
          {showIProduct ? showIProduct.productName : ''}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showIProduct ? showIProduct.description : ''}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseI}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProductList;
