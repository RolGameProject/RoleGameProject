import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';

function EntityDetailsModal({ entity, entityType, show, handleClose }) {
  const renderAbilities = (abilities) =>
    abilities.map((ability, index) => (
      <li key={index}>
        {ability.name}: {ability.value}
      </li>
    ));

  const renderEffects = (effects) =>
    effects.map((effect, index) => (
      <li key={index}>
        {effect.name} - Duración: {effect.duration}, Potencia: {effect.potency}
      </li>
    ));

  // Determinar ruta de la imagen
  const imagePath = `/assets/${entityType === 'character' ? 'character' : 'enemy'}/${entityType === 'character' ? entity.classType : entity.type}.png`;

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{entity.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="align-items-center">
          {/* Columna para los detalles de texto */}
          <Col xs={12} md={6}>
            <p>
              <strong>Tipo:</strong> {entityType === 'character' ? entity.classType : entity.type}
            </p>
            <p>
              <strong>Salud:</strong> {entity.health}
            </p>
            <p>
              <strong>Habilidades:</strong>
            </p>
            <ul>{renderAbilities(entity.abilities)}</ul>
            {entityType === 'enemy' && entity.effects && (
              <>
                <p>
                  <strong>Efectos:</strong>
                </p>
                <ul>{renderEffects(entity.effects)}</ul>
              </>
            )}
          </Col>

          {/* Columna para la imagen */}
          <Col xs={12} md={6} className="text-center">
            <img
              src={imagePath}
              alt={`${entityType === 'character' ? entity.classType : entity.type}`}
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            />
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EntityDetailsModal;
