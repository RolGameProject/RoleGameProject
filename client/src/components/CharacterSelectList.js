import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';

const CharacterSelectList = ({ characters, onSelectCharacter }) => {
  return (
    <Row className="g-3">
      {characters.map((character) => (
        <Col key={character._id} xs={12} sm={12} md={6} lg={4} xl={3}>
          <Card
            className="h-100"
            onClick={() => onSelectCharacter(character._id)} // Selecciona el personaje
            style={{
              cursor: 'pointer',
              width: '100%', // Ancho completo de la columna
              height: '200px', // Altura fija para todas las tarjetas
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              textAlign: 'center',
              boxSizing: 'border-box', // Asegura que el ancho y alto se calculen correctamente
              border: '1px solid #ddd', // Borde para diferenciar las tarjetas
            }}
          >
            <Card.Body>
              <Card.Title>{character.name}</Card.Title>
              <Card.Subtitle className="text-muted">
                {character.classType}
              </Card.Subtitle>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CharacterSelectList;
