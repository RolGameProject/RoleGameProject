// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCharacter, getCharactersByUser } from '../services/characterService';
import { createGame, joinGame, /*getGameDetails,*/ getAllGames } from '../services/gameService';
import { getCurrentUser } from '../services/userService.js';
import CreateEntityForm from '../components/createEntityForm.js';
import EntityCardList from '../components/EntityCardList.js';
// import EntityDetailsModal from '../components/EntityDetailsModal.js';
import { Button, Row, Col, Form, Toast, Modal, Card } from 'react-bootstrap';
// import ProtectedRoute from '../components/ProtectedRoute.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import CharacterSelectList from '../components/CharacterSelectList.js';
// import { deleteCharacter } from '../services/characterService';

function Dashboard() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameName, setGameName] = useState('');
  const [gameId, setGameId] = useState('');
  // const [invitationLink, setInvitationLink] = useState('');
  const [message, setMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false); // Control del modal de creación
  const navigate = useNavigate();
  // const [showCharacterListModal, setShowCharacterListModal] = useState(false); // Estado para controlar el modal de personajes
  const [selectedCharacterId, setSelectedCharacterId] = useState(null); // ID del personaje seleccionado
  // const [showCharacterDetailsModal, setShowCharacterDetailsModal] = useState(false); // Estado para controlar el modal de detalles
  const [showCharacterSelectModal, setShowCharacterSelectModal] = useState(false);
  const [joinedGames, setJoinedGames] = useState([]);

  // Método para abrir el modal de selección de personaje
  const handleOpenCharacterSelectModal = () => {
    setShowCharacterSelectModal(true);
  };

  // Método para cerrar el modal de selección de personaje
  const handleCloseCharacterSelectModal = () => {
    setShowCharacterSelectModal(false);
  };

  // Método para manejar la selección de un personaje
  const handleSelectCharacter = (characterId) => {
    setSelectedCharacterId(characterId);
    handleCloseCharacterSelectModal();
  };


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
  
        // Obtener usuario actual
        const user = await getCurrentUser();
        if (!user) {
          setError('Usuario no autenticado.');
          setLoading(false);
          return;
        }
        console.log('Usuario autenticado:', user);
  
        // Obtener personajes del usuario
        const charactersResponse = await getCharactersByUser();
        setCharacters(charactersResponse);
  
        // Obtener todas las partidas guardadas
        const allGames = await getAllGames();
        console.log('Todas las partidas obtenidas:', allGames);
  
        // Filtrar las partidas a las que está unido el usuario
        // const joinedGamesData = [];
        // for (let game of allGames) {
        //   const gameDetails = await getGameDetails(game._id);

        //   if (gameDetails.players.some(player => player._id === user._id) || gameDetails.gameMaster._id === user._id) {
        //     joinedGamesData.push(gameDetails);
        //   }
        // }
             // Filtrar las partidas a las que está unido el usuario
        const joinedGamesData = allGames.filter(game => 
          game.players.some(player => player/*._id*/ === user.id) ||
          game.gameMaster/*.id*/ === user.id
        );
        setJoinedGames(joinedGamesData);
        // console.log('Partidas filtradas para el usuario:', joinedGamesData);

  
        setLoading(false); // Todo cargado correctamente
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar datos.');
      } finally  {
        setLoading(false);
      }
    };
  
    fetchData();
  }, []); // Sin dependencias porque solo necesita ejecutarse una vez al montar
  


  const handleCreateCharacter = async (newCharacter) => {
    try {
      await createCharacter(newCharacter);
      setMessage('Personaje creado con éxito');
      setShowToast(true);
      const updatedCharacters = await getCharactersByUser();
      setCharacters(updatedCharacters);
    } catch (error) {
      setMessage('Error al crear el personaje');
      setShowToast(true);
    }
  };

  const handleCreateGame = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        setMessage('Error: Usuario no autenticado.');
        setShowToast(true);
        return;
      }
      const gameData = { gameName, gameMaster: user.googleId };
      const result = await createGame(gameData);
      setGameName('');
      navigate('/game-room', { state: { gameId: result.gameId } });
    } catch (error) {
      setMessage('Error creando la partida');
      setShowToast(true);
    }
  };

  // Método para unirse a la partida
  const handleJoinGame = async () => {
    try {
      if (!gameId || !selectedCharacterId) {
        alert('Debes seleccionar un personaje y una partida.');
        return;
      }
      const user = await getCurrentUser();
      if (!user) {
        setMessage('Error: Usuario no autenticado.');
        setShowToast(true);
        return;
      }
      const gameData = { gameName: gameId, playerId: user.googleId, characterId: selectedCharacterId };
      console.log('Datos enviados a joinGame:', gameData); // Log antes de llamar al servicio

      const response = await joinGame(gameData);
      const discordLink = response.invitationLink;
      console.log('Navegando a GameRoom con state:', { gameId, discordLink }); // Verificar datos de state

      navigate('/game-room', { state: { gameId, discordLink } });
    } catch (error) {
      console.error('Error uniéndose a la partida:', error);
      setMessage('Error uniéndote a la partida');
      setShowToast(true);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p>{error}</p>;

  return (
    // <ProtectedRoute isAuthenticated={isAuthenticated}>
      <div>
        <h2 className="text-center">Panel de Usuario</h2>
        <p className="text-center">Aquí puedes gestionar tus personajes y partidas.</p>

        <Row>
          {/* Columna de personajes */}
          <Col xs={12} md={6} className="mb-4">
            <h3>Mis Personajes</h3>
            {characters.length === 0 ? (
              <p>No tienes personajes creados.</p>
            ) : (
              <EntityCardList
                entities={characters}
                entityType="character"
              />
            )}

            {/* Botón para abrir el modal de creación de personajes */}
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              style={{ marginTop: '20px' }}
            >
              Crear Nuevo Personaje
            </Button>

            {/* Modal para crear un personaje */}
            <CreateEntityForm
              show={showModal}
              handleClose={() => setShowModal(false)}
              handleCreate={handleCreateCharacter}
              entityType="character"
            />
          </Col>

          {/* Columna de partidas */}
          <Col xs={12} md={6} className="mb-4">
          <h3>Mis Partidas</h3>

          {joinedGames.length === 0 ? (
            <p>No tienes partidas.</p>  // Aquí mostramos el mensaje si no hay partidas unidas
          ) : (
            <ul>
              {joinedGames.map((game) => (

                <Card
                className='h-100'
                onClick={() => navigate('/game-room', { state: { gameId: game._id } })}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  width: '100%',
                  height: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  border: '1px solid #ddd',
                }}
                >
                  <Card.Body>
                    <Card.Title>{game.gameName}</Card.Title>
                    <Card.Subtitle>{game._id}</Card.Subtitle>
                  </Card.Body>

                </Card>
                /*<li key={game._id}>
                  <Button
                    variant="link"
                    onClick={() => navigate('/game-room', { state: { gameId: game._id } })} // Redirigimos a GameRoom con el gameId
                  >
                    {game.gameName}
                  </Button>
                </li>*/
              ))}
            </ul>
          )}
            <h4>Crear Nueva Partida</h4>
            <Form.Control
              type="text"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="Nombre de la partida"
              className="mb-3"
            />
            <Button onClick={handleCreateGame} variant="success" className="mb-3">
              Crear Partida
            </Button>

            <h4>Unirse a una Partida</h4>
            <Form.Control
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="ID de la partida"
              className="mb-3"
            />
            <Button onClick={handleOpenCharacterSelectModal} variant="primary">
              Seleccionar Personaje
            </Button>

            <Button onClick={handleJoinGame} variant="primary" className="ms-2">
              Unirse
            </Button>

            {/* Modal de selección de personaje */}
            <Modal show={showCharacterSelectModal} onHide={handleCloseCharacterSelectModal}>
              <Modal.Header closeButton>
                <Modal.Title>Seleccionar Personaje</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <CharacterSelectList
                  characters={characters}  // Aquí debe pasarse el listado de personajes
                  onSelectCharacter={handleSelectCharacter}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseCharacterSelectModal}>
                  Cerrar
                </Button>
              </Modal.Footer>
            </Modal>
            
          </Col>
        </Row>

        {/* Toast de mensaje de resultado */}
        <Toast
          show={showToast}
          onClose={() => setShowToast(false)}
          delay={5000}
          autohide
          bg="success"
          className="position-fixed bottom-0 end-0 m-3"
        >
          <Toast.Body>{message}</Toast.Body>
        </Toast>
      </div>
    // </ProtectedRoute>
  );
}

export default Dashboard;
