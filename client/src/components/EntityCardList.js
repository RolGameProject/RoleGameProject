import React, { useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import EntityDetailsModal from './EntityDetailsModal';

function EntityCardList({ entities, entityType }) {
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = (entity) => {
    setSelectedEntity(entity);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedEntity(null);
    setShowModal(false);
  };

  return (
    <>
      <Row className="g-3">
        {entities.map((entity) => (
          <Col key={entity._id} xs={12} sm={12} md={6} lg={4} xl={3}>
            <Card
              className="h-100"
              onClick={() => handleCardClick(entity)}
              style={{
                cursor: 'pointer',
                width: '100%', // Ancho completo de la columna
                height: '200px', // Altura fija para todas las tarjetas, puede ajustarse
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                textAlign: 'center',
                boxSizing: 'border-box', // Para asegurar que el ancho y alto se calculen correctamente
                border: '1px solid #ddd', // Añadido borde para diferenciar las tarjetas
              }}
            >
              <Card.Body>
                <Card.Title>{entity.name}</Card.Title>
                <Card.Subtitle className="text-muted">
                  {entityType === 'character' ? entity.classType : entity.type}
                </Card.Subtitle>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {selectedEntity && (
        <EntityDetailsModal
          entity={selectedEntity}
          entityType={entityType}
          show={showModal}
          handleClose={handleCloseModal}
        />
      )}
    </>
  );
}

export default EntityCardList;
