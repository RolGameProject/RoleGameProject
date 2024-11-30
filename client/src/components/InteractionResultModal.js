import React from 'react';
import { Modal, Row, Col } from 'react-bootstrap';
import Button from './Button';

const InteractionResultModal = ({ show, onClose, interactionData }) => {
  const { result, characterRoll, enemyRoll, character, enemy } = interactionData;

  // Estilos según el resultado
  const resultStyles = {
    satisfactorio: { color: '#1ae706' },
    bueno: { color: '#3ab203' }, // Verde grisáceo
    empate: { color: '#000000' },
    malo: { color: '#bd0604' }, // Rojo grisáceo
    catastrófico: { color: '#ff4545' },
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Resultado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Mostrar resultado en color */}
        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', textAlign: 'center', ...resultStyles[result] }}>
          {result.charAt(0).toUpperCase() + result.slice(1)}
        </p>

        {/* Dividir en dos columnas */}
        <Row>
          {/* Columna de personaje */}
          <Col md={6} className="text-center">
            <div>
              <h3><strong>{character.name}</strong></h3>
              <p><strong>Tirada:</strong> {characterRoll}</p>
              <p><strong>Salud:</strong> {character.health}</p>
            </div>
          </Col>

          {/* Columna de enemigo */}
          <Col md={6} className="text-center">
            <div>
              <h3><strong>{enemy.name}</strong></h3>
              <p><strong>Tirada:</strong> {enemyRoll}</p>
              <p><strong>Salud:</strong> {enemy.health}</p>
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default InteractionResultModal;
