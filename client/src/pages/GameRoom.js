import React, { useCallback, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import ProtectedRoute from '../components/ProtectedRoute';
import LoadingSpinner from '../components/LoadingSpinner';
import axios from 'axios';
import { getCurrentUser } from '../services/userService.js';
import Button from '../components/Button.js';
import CreateEntityForm from '../components/createEntityForm.js';
import EntityCardList from '../components/EntityCardList'; // Importar EntityCardList
import { Container, Row, Col, Modal, Form } from 'react-bootstrap';
// import EntityDetailsModal from '../components/EntityDetailsModal.js';
// import { interact } from '../services/interactionService.js'
import InteractionResultModal from '../components/InteractionResultModal';

function GameRoom() {
  const [isMaster, setIsMaster] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameDetails, setGameDetails] = useState(null);
  const [enemies, setEnemies] = useState([]);
  const [showCreateEnemyModal, setShowCreateEnemyModal] = useState(false);
  // const [selectedEntity, setSelectedEntity] = useState(null); // Entidad seleccionada para mostrar en el modal
  // const [entityType, setEntityType] = useState(''); // Tipo de la entidad (character/enemy)
  const [showInteractionModal, setShowInteractionModal] = useState(false); // Modal para interacción
  const [selectedCharacter, setSelectedCharacter] = useState(null); // Personaje seleccionado
  const [selectedEnemy, setSelectedEnemy] = useState(null); // Enemigo seleccionado
  const [selectedStat, setselectedStat] = useState('Fuerza'); // Habilidad seleccionada
  const [selectedDiceType, setSelectedDiceType] = useState(20); // Tipo de dado seleccionado
  const navigate = useNavigate();
  const location = useLocation();
  const [interactionResult, setInteractionResult] = useState(null); // Resultado de la interacción
  const [showResultModal, setShowResultModal] = useState(false); // Controla el nuevo modal


  const { gameId, discordLink } = location.state || {};
  // console.log('location.state en GameRoom: ', location.state);
  // console.log('Datos recibidos en GameRoom: ', {gameId, discordLink});

   const fetchGameDetails = useCallback(async () => {
    try {
      // console.log('gameId en fetchGameDetails gameroom: ', gameId);
      const user = await getCurrentUser(); // Asegúrate de que esta función esté definida y funcione correctamente
      // console.log('user en gameroom: ', user);
      const response = await axios.get(`/api/games/${gameId}/details`);
      const game = response.data;
      // console.log('game en gameroom: ', game);

      setGameDetails(game);
      setIsMaster(game.gameMaster.id === user./*userI*/id);
    } catch (error) {
      // console.log('Error en fetchGameDetails');
      console.error('Error al obtener los detalles de la partida:', error);
      navigate('/dashboard');
    }
  }, [gameId, navigate]); // Dependencias de fetchGameDetails

  // Memorizar fetchEnemies con useCallback
  const fetchEnemies = useCallback(async () => {
    try {
      const response = await axios.get('/api/enemies');
      setEnemies(response.data);
    } catch (error) {
      console.error('Error al obtener la lista de enemigos:', error);
    }
  }, []);

const fetchAllData = useCallback(async () => {
  setIsLoading(true);
  await Promise.all([fetchGameDetails(), fetchEnemies()]);
  setIsLoading(false);
}, [fetchGameDetails, fetchEnemies]);

  // console.log('gameId antes de useEffect en gameroom: ', gameId);
  useEffect(() => {
    // console.log('State recibido en GameRoom:', location.state); // Confirmar lo recibido

    if (!gameId) {
      // console.log('error en useEffect GameRoom');
      // console.log('Error: gameId no encontrado en GameRoom, redirigiendo a dashboard');

      navigate('/dashboard');
      return;
    }

    fetchAllData();
  }, [gameId, navigate, fetchAllData, location.state]);

  const handleCreateEnemy = async (enemyData) => {
    try {
      console.log('enemyData en GameRoom antes de enviar: ', enemyData);
      await axios.post('/api/enemies', enemyData, {
      withCredentials: true,
    });
      const response = await axios.get('/api/enemies');
      console.log('Respuesta obtenida al crear enemigos GameRoom; ', response.data);
      setEnemies(response.data);
    } catch (error) {
      console.error('Error al crear el enemigo:', error);
    }
  };

  const handleInteraction = async () => {
    try {
      const payload = {
        character: selectedCharacter, // Objeto completo
        enemy: selectedEnemy,         // Objeto completo
        selectedStat,
        diceType: selectedDiceType,
      };
      // console.log('Payload enviado:', payload);
      const response = await axios.post('/api/interaction/interact', payload);
      // console.log('Respuesta de interacción:', response.data);

      setInteractionResult(response.data);
      setShowResultModal(true);

      // Refrescar datos del juego y enemigos
      await Promise.all([fetchGameDetails(), fetchEnemies()]);

      setShowInteractionModal(false);
    } catch (error) {
      console.error('Error al realizar la interacción:', error.response?.data || error.message);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const visibleEnemies = isMaster
    ? enemies
    : enemies.filter((enemy) => enemy.interactionRequired);

  return (
    // <ProtectedRoute isAuthenticated={isAuthenticated}>
      <Container>
        <div className="text-center my-4">
          <h2>Sala de Juego</h2>
          {gameDetails && (
            <>
              <p><strong>Nombre de la Partida:</strong> {gameDetails.gameName}</p>
              <p>
                {isMaster ? (
                  <Button
                    variant="primary"
                    onClick={() => window.open('https://discord.gg/j5mFc88z', '_blank')}
                  >
                    Ir al servidor de Discord
                  </Button>
                ) : (
                  <Button
                    variant="success"
                    onClick={() => window.open(discordLink, '_blank')}
                    disabled={!discordLink}
                  >
                    {discordLink ? 'Unirse al canal de Discord' : 'Sin enlace'}
                  </Button>
                )}
              </p>
              {isMaster && (
                <>
                  <p><strong>ID de la Partida:</strong> {gameDetails.gameId}</p>
                  <p><strong>Estado:</strong> {gameDetails.status}</p>
                  {/* Botón de interacción */}
                  <Button
                    variant="info"
                    onClick={() => setShowInteractionModal(true)}
                    className="mt-3"
                  >
                    Realizar Interacción
                  </Button>
                </>
              )}
            </>
          )}
        </div>

        <Row>
          <Col md={6}>
            <h3>Personajes en la Partida</h3>
            {gameDetails && gameDetails.players.length > 0 ? (
              gameDetails.players.map((player) => (
                <div key={player.id}>
                  {player.characters.length > 0 ? (
                    <EntityCardList
                      entities={player.characters}  // Pasamos los personajes del jugador
                      entityType="character"
                      onEntitySelect={setSelectedCharacter} // Establecer personaje seleccionado
                    />
                  ) : (
                    <p>No hay personajes para este jugador.</p>
                  )}
                </div>
              ))
            ) : (
              <p>No hay jugadores en la partida.</p>
            )}
          </Col>

          <Col md={6}>
            <h3>Enemigos en la Partida</h3>
            {visibleEnemies.length > 0 ? (
              <EntityCardList
                entities={visibleEnemies}
                entityType="enemy"
                onEntitySelect={setSelectedEnemy} // Establecer enemigo seleccionado
              />
            ) : (
              <p>No hay enemigos visibles.</p>
            )}
            {isMaster && (
              <Button
                variant="success"
                onClick={() => setShowCreateEnemyModal(true)}
                className="mt-3"
              >
                Crear Enemigos
              </Button>
            )}
          </Col>
        </Row>

        <CreateEntityForm
          show={showCreateEnemyModal}
          handleClose={() => setShowCreateEnemyModal(false)}
          handleCreate={handleCreateEnemy}
          entityType="enemy"
        />

        {/* Modal de interacción */}
        <Modal show={showInteractionModal} onHide={() => setShowInteractionModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Seleccionar Personaje y Enemigo</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Seleccionar Personaje</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => {
                    const characterId = e.target.value; // Obtiene el ID del personaje seleccionado
                    const character = gameDetails?.players
                      ?.flatMap(player => player.characters) // Extrae todos los personajes
                      ?.find(char => char.id === characterId); // Busca por ID
                    // console.log('Personaje seleccionado:', character); // Confirma el personaje seleccionado
                    setSelectedCharacter(character || null); // Establece el estado o null si no lo encuentra
                  }}
                >
                  <option value="">Seleccione un personaje</option>
                  {gameDetails?.players.flatMap(player =>
                    player.characters.map(character => (
                      <option key={character.id} value={character.id}>
                        {character.name}
                      </option>
                    ))
                  )}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Seleccionar Enemigo</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => {
                    const enemyId = e.target.value; // Obtén el ID del enemigo seleccionado
                    // console.log('enemyId: ', enemyId);
                    const enemy = enemies.find(en => en.name === enemyId); // Busca el enemigo en el estado enemies
                    // console.log('Enemigo seleccionado:', enemy); // Confirmación en consola
                    setSelectedEnemy(enemy || null); // Actualiza el estado
                  }}
                >
                  <option value="">Seleccione un enemigo</option>
                  {enemies.map(enemy => (
                    <option key={enemy.id} value={enemy.id}>
                      {enemy.name}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Seleccionar Habilidad</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => setselectedStat(e.target.value)}
                  value={selectedStat}
                >
                  <option value="Fuerza">Fuerza</option>
                  <option value="Agilidad">Agilidad</option>
                  <option value="Inteligencia">Inteligencia</option>
                  <option value="Carisma">Carisma</option>
                  <option value="Sabiduría">Sabiduría</option>
                  <option value="Constitución">Constitución</option>
                </Form.Control>
              </Form.Group>
              <Form.Group>
                <Form.Label>Seleccionar Tipo de Dado</Form.Label>
                <Form.Control
                  as="select"
                  onChange={(e) => setSelectedDiceType(Number(e.target.value))}
                  value={selectedDiceType}
                >
                  <option value={6}>Dado de 6 caras</option>
                  <option value={10}>Dado de 10 caras</option>
                  <option value={20}>Dado de 20 caras</option>
                </Form.Control>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInteractionModal(false)}>
              Cerrar
            </Button>
            <Button variant="primary" onClick={handleInteraction}>
              Realizar Interacción
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Nuevo modal para mostrar el resultado */}
        {interactionResult && (
          <InteractionResultModal
            show={showResultModal}
            onClose={() => setShowResultModal(false)}
            interactionData={interactionResult}  // Pasar los datos completos de la interacción
          />
        )}

      </Container>
    // </ProtectedRoute>
  );
}

export default GameRoom;
