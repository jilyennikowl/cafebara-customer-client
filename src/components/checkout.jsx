
import axios from 'axios';
import { useState } from 'react';
import { Modal, Button, Row, Col, Form, ToastContainer, Toast } from 'react-bootstrap';
import genPDF from '../utils/genPDF';

function Checkout(props) {
  const {
    show,
    setCheckoutShown,
    setShowSuccess,
    setProductsAddedToCart,
    setAddedToCart,
    products
  } = props
  const cartData = products.map((p) => {
    return {
      ...p,
      quantity: 1,
    }
  })
  const [cart, setCart] = useState(cartData)
  const setQuantity = (c, id) => {
    setCart((items) => {
      const objectIndex = items.findIndex((d) => d._id === id)
      items[objectIndex].quantity = c
      return items
    })
  }
  const handleClose = () => setCheckoutShown(false);

  // for payment modal
  const [customerName, setCustomerName] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [showP, setShowP] = useState(false);
  const [showAPIError, setShowAPIError] = useState(false);
  const [APIError, setAPIError] = useState('')

  const handleCloseP = () => setShowP(false)
  const handleShowP = () => setShowP(true)

  const handleSubmit = () => {
    const fields = [customerName, customerAddress]
    for (const i in fields) {
      if (!fields[i]) {
        setAPIError('incomplete form fields')
        setShowAPIError(true)
        return
      }
    }
    const hasQuantity = cart.filter(({quantity}) => parseInt(quantity))
    const data = {
      items: hasQuantity.map((i) => {
        const {
          _id,
          productCode,
          productName,
          price,
          createdAt,
          updatedAt,
          quantity
        } = i
        return {
          product: {
            _id,
            productCode,
            productName,
            price: parseFloat(price),
            createdAt,
            updatedAt,
          },
          quantity: parseFloat(quantity),
        }
      }),
      metadata: {
        customerName,
        customerAddress,
      },
      isPaid: false,
    }
    axios.post(
      `${process.env.REACT_APP_API_HOST}/public/transactions`,
      data,
    )
    .then((response) => {
      setAddedToCart(0)
      setCheckoutShown(false)
      setShowP(false)
      setShowSuccess(true)
      setProductsAddedToCart([])
      genPDF(response.data.transaction)
      return
    })
    .catch((error) => {
      setAPIError(error.response.data.message)
      setShowAPIError(true)
      return
    })
  }

  return (
    <div className="Checkout">
      <Modal hidden={showP} centered show={show} onHide={handleClose} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Cart</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row style={{marginBottom: '20px'}}>
            <Col xs={8} sm={9} className="text-dark">
              <b>Items</b>
            </Col>
            <Col xs={4} sm={3} className="text-dark">
              <b>Quantity</b>
            </Col>
          </Row>
          {products.map((p, i) => (
            <Row key={i}>
              <Col xs={8} sm={9}>
                <span className='text-primary'>PHP {p.price}</span>&nbsp;
                <span className='text-secondary'>{p.productCode}</span>&nbsp;
                {p.productName.length > 30 ? `${p.productName.substring(0, 30)}...` : p.productName}
              </Col>
              <Col xs={4} sm={3}>
                <Form>
                  <Form.Group className="mb-3" controlId="price">
                    <Form.Control 
                      type="number"
                      min="0"
                      maxLength={100}
                      onChange={e => setQuantity(e.target.value, p._id)}
                      placeholder="1" />
                  </Form.Group>
                </Form>
              </Col>
            </Row>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleShowP}>
            Checkout
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal centered show={showP} onHide={handleCloseP} animation={false}>
        <Modal.Header closeButton>
          <Modal.Title>Invoice</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row style={{marginBottom: '10px'}}>
            <Col xs={8} sm={9} className="text-dark">
              <b>Items</b>
            </Col>
            <Col xs={4} sm={3} className="text-dark">
              <b>Price</b>
            </Col>
          </Row>
          {cart.map((item) => {
            if (parseInt(item.quantity)) {
              return  (
                <Row key={item._id}>
                  <Col xs={8} sm={9}>
                    <span className='text-secondary'>{item.productCode}</span>&nbsp;
                    {item.productName.length > 30 ? `${item.productName.substring(0, 30)}...` : item.productName}
                  </Col>
                  <Col xs={4} sm={3}>
                    <span className='text-primary'>PHP {item.price}</span>&nbsp;x&nbsp;
                    <span className='text-primary'>{item.quantity}</span>
                  </Col>
                </Row>
              )
            }
            return null
          })}
          <div style={{marginTop: '20px'}} className="d-flex justify-content-end">
            <h5><b>Total: <span className="text-primary">PHP {cart.reduce((curr, acc) => {
              curr += acc.price * acc.quantity
              return curr
            }, 0)}</span></b></h5>
          </div>
          <div>
            <Form>
              <Form.Group className="mb-3" controlId="customerName">
                <Form.Label>Customer Name</Form.Label>
                <Form.Control
                  maxLength={200}
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="customerAddress">
                <Form.Label>Customer Address</Form.Label>
                <Form.Control 
                  maxLength={300} 
                  value={customerAddress}
                  onChange={e => setCustomerAddress(e.target.value)} />
              </Form.Group>
            </Form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseP}>
            Back
          </Button>
          <Button variant="success" onClick={handleSubmit}>
            Print Order Receipt
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position='bottom-end' style={{position: 'fixed', padding: '20px'}}>
        <Toast bg="danger" onClose={() => setShowAPIError(false)} show={showAPIError} delay={5000} autohide>
          <Toast.Header>
            <strong className="me-auto">Alert!</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{APIError}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
}

export default Checkout;
