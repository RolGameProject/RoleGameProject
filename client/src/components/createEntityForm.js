import React, { useState } from 'react';
import { Form, Button, Modal } from 'react-bootstrap';
import { getCurrentUser } from '../services/userService';
import '../styles/styles.css'

const CreateEntityForm = ({ show, handleClose, handleCreate, entityType }) => {
    // Estado para los campos del formulario
    const [name, setName] = useState('');
    const [type, setType] = useState('');
    const [health, setHealth] = useState(100);
    const [abilities, setAbilities] = useState({
        Fuerza: 0,
        Agilidad: 0,
        Inteligencia: 0,
        Carisma: 0,
        Sabiduría: 0,
        Constitución: 0,
    });
    const [effects, setEffects] = useState([]);
    const [interactionRequired, setInteractionRequired] = useState(false);

    // Obtener el usuario autenticado para el campo 'createdBy'
    const [createdBy, setCreatedBy] = useState('');

    // Obtener el usuario autenticado al cargar el componente
    React.useEffect(() => {
        const fetchUser = async () => {
            const user = await getCurrentUser();
            if (user) setCreatedBy(user./*userI*/id);
        };
        fetchUser();
    }, []);

    // Opciones de clases según el tipo de entidad
    const options = entityType === 'character'
        ? ['Barbaro', 'Elfo', 'Mago', 'Humano', 'Enano']
        : ['Bestia', 'Zombie', 'Humano', 'Demonio', 'Constructor', 'Elemental'];

    // Opciones de habilidades
    const abilityOptions = ['Fuerza', 'Agilidad', 'Inteligencia', 'Carisma', 'Sabiduría', 'Constitución'];

    // Opciones de efectos (solo para enemigos)
    const effectOptions = ['Veneno', 'Paralización', 'Quemado', 'Sangrado'];

    // Manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        // Convertir el objeto de habilidades en un arreglo de objetos
        const abilityValues = Object.keys(abilities).map((abilityName) => ({
            name: abilityName,
            value: abilities[abilityName],
        }));

        // Preparar los datos para la creación de la entidad
        const entityData = {
            name,
            [entityType === 'character' ? 'classType' : 'type']: type,
            health,
            abilities: abilityValues,
            interactionRequired: entityType === 'enemy' ? interactionRequired : undefined,
            effects: entityType === 'enemy' ? effects : [],
            createdBy: user,
        };

        handleCreate(entityData);
        handleClose();
        resetForm();
    };

    // Función para restablecer el formulario
    const resetForm = () => {
        setName('');
        setType('');
        setHealth(100);
        setAbilities({
            Fuerza: 0,
            Agilidad: 0,
            Inteligencia: 0,
            Carisma: 0,
            Sabiduría: 0,
            Constitución: 0,
        });
        setEffects([]);
        setInteractionRequired(false);
    };

    // Función para manejar el cambio de habilidad
    const handleAbilityChange = (ability, value) => {
        setAbilities((prevAbilities) => ({
            ...prevAbilities,
            [ability]: value,  // Actualizamos el valor de la habilidad específica
        }));
    };

    // Manejador para añadir un efecto
    const handleAddEffect = () => {
        setEffects([...effects, { name: '', duration: 1, potency: 1 }]);
    };

    // Manejador para actualizar un efecto
    const handleEffectChange = (index, field, value) => {
        const updatedEffects = [...effects];
        updatedEffects[index][field] = value;
        setEffects(updatedEffects);
    };

    return (
        <Modal 
        show={show} 
        onHide={handleClose} 
        centered

        >
            <Modal.Header closeButton>
                <Modal.Title>{entityType === 'character' ? 'Crear Personaje' : 'Crear Enemigo'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {/* Campo: Nombre */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Introduce el nombre"
                            required
                        />
                    </Form.Group>

                    {/* Campo: Clase o Tipo */}
                    <Form.Group className="mb-3">
                        <Form.Label>{entityType === 'character' ? 'Clase' : 'Tipo'}</Form.Label>
                        <Form.Select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            required
                        >
                            <option value="">Seleccionar</option>
                            {options.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    {/* Campo: Salud */}
                    <Form.Group className="mb-3">
                        <Form.Label>Salud</Form.Label>
                        <Form.Control
                            type="number"
                            value={health}
                            onChange={(e) => setHealth(Math.min(100, Math.max(1, e.target.value)))}
                            min="1"
                            max="100"
                            required
                        />
                    </Form.Group>

                    {/* Campo: Habilidades */}
                    <Form.Group className="mb-3">
                        <Form.Label>Habilidades</Form.Label>
                        {abilityOptions.map((ability) => (
                            <div key={ability} className="mb-2">
                                <Form.Label>{ability}</Form.Label>
                                <Form.Control
                                    type="number"
                                    value={abilities[ability]}  // Muestra el valor actual de la habilidad
                                    onChange={(e) => handleAbilityChange(ability, e.target.value)}  // Llama a la función de cambio
                                    min="-50"
                                    max="100"
                                    required
                                />
                            </div>
                        ))}
                    </Form.Group>

                    {/* Campo: Interaction Required (solo para enemigos) */}
                    {entityType === 'enemy' && (
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Puede interactuar"
                                checked={interactionRequired}
                                onChange={(e) => setInteractionRequired(e.target.checked)}
                            />
                        </Form.Group>
                    )}

                    {/* Campo: Efectos (solo para enemigos) */}
                    {entityType === 'enemy' && (
                        
                        <Form.Group className="mb-3">
                            <Form.Label>Efectos</Form.Label>
                            {effects.map((effect, index) => (
                                <div key={index} className="mb-3">
                                    <Form.Label>Tipo</Form.Label>
                                    <Form.Select
                                        value={effect.name}
                                        onChange={(e) => handleEffectChange(index, 'name', e.target.value)}
                                    >
                                        <option value="">Seleccionar efecto</option>
                                        {effectOptions.map((option) => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Label>Duración</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={effect.duration}
                                        placeholder="Duración"
                                        onChange={(e) => handleEffectChange(index, 'duration', e.target.value)}
                                        min="1"
                                    />
                                    <Form.Label>Potencia</Form.Label>
                                    <Form.Control
                                        type="number"
                                        value={effect.potency}
                                        placeholder="Potencia"
                                        onChange={(e) => handleEffectChange(index, 'potency', e.target.value)}
                                        min="1"
                                    />
                                </div>
                            ))}
                            <Button variant="secondary" onClick={handleAddEffect}>Añadir Efecto</Button>
                        </Form.Group>
                    )}

                    <Button variant="primary" type="submit">
                        Crear {entityType === 'character' ? 'Personaje' : 'Enemigo'}
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default CreateEntityForm;
