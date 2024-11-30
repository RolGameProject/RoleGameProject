// src/components/Button.js
import React from 'react';
import { Button } from 'react-bootstrap';

function ButtonComponent({ variant, onClick, children }) {
  return (
    <Button variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}

export default ButtonComponent;
