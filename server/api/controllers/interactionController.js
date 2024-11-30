const { rollDice } = require('../utils/diceRoller');
const { Character } = require('../models/characterModel'); // Modelo de personajes
const { Enemy } = require('../models/enemyModel'); // Modelo de enemigos

// Calcula el modificador en base al valor de la habilidad del personaje o enemigo
function calculateModifier(stat) {
    return stat / 10; // El modificador se obtiene dividiendo el valor entre 10
}

// Gestionar la interacción entre un personaje y un enemigo
const interaction = async (req, res) => {
    const { character, enemy, selectedStat, diceType } = req.body;

    try {
        // Depuración: Verifica que el modelo Enemy tiene las funciones esperadas
        console.log('Enemy.updateOne:', typeof Enemy.updateOne); // Debe ser 'function'
        console.log('Enemy.findById:', typeof Enemy.findById); // Debe ser 'function'

        // Usa datos del front si son completos; si no, obtén los datos desde la base de datos
        const characterDocument =
            character?.abilities && character?.health
                ? character
                : await Character.findById(character?._id || character?.id);

        const enemyDocument =
            enemy?.abilities && enemy?.health
                ? enemy
                : await Enemy.findById(enemy?._id || enemy?.id);

        // Verifica si se encontraron los documentos necesarios
        if (!characterDocument) {
            return res.status(404).json({ error: 'Personaje no encontrado' });
        }
        if (!enemyDocument) {
            return res.status(404).json({ error: 'Enemigo no encontrado' });
        }

        // Determina el tipo de dado a utilizar según el parámetro (6, 10 o 20)
        const maxRoll = diceType === 6 ? 6 : diceType === 10 ? 10 : 20;

        // Busca la habilidad seleccionada en el array de habilidades del personaje y enemigo
        const characterAbility = characterDocument.abilities.find(a => a.name === selectedStat);
        const enemyAbility = enemyDocument.abilities.find(a => a.name === selectedStat);

        // Si el personaje o el enemigo no tienen la habilidad seleccionada, lanza un error
        if (!characterAbility) {
            return res.status(400).json({ error: `Habilidad "${selectedStat}" no encontrada en el personaje` });
        }
        if (!enemyAbility) {
            return res.status(400).json({ error: `Habilidad "${selectedStat}" no encontrada en el enemigo` });
        }

        // Calcula los modificadores para el personaje y el enemigo
        const characterModifier = calculateModifier(characterAbility.value);
        const enemyModifier = calculateModifier(enemyAbility.value);

        // Realiza tiradas de dados para el personaje y el enemigo
        const characterRoll = rollDice(maxRoll) + characterModifier;
        const enemyRoll = rollDice(maxRoll) + enemyModifier;

        const outcome = characterRoll - enemyRoll;
        let result, healthImpact;

        // Clasifica el resultado de la interacción
        if (outcome >= 10) {
            result = 'satisfactorio';
            healthImpact = -10;
        } else if (outcome > 0 && outcome < 10) {
            result = 'bueno';
            healthImpact = -5;
        } else if (outcome === 0) {
            result = 'empate';
            healthImpact = 0;
        } else if (outcome < 0 && outcome > -10) {
            result = 'malo';
            healthImpact = -5;
        } else {
            result = 'catastrófico';
            healthImpact = -10;
        }

        // Aplica el daño a la salud del personaje o del enemigo según el resultado
        if (healthImpact < 0) {
            if (result === 'malo' || result === 'catastrófico') {
                characterDocument.health += healthImpact;
            } else {
                enemyDocument.health += healthImpact;
            }
        }



        // Si el enemigo tiene efectos, calcula si aplica alguno al personaje
        let inflictedEffect = null;
        if (enemyDocument.effects[0]) {
            if (result === 'malo' && Math.random() < 0.5) {
                // inflictedEffect = enemyDocument.effects[0].name;
                characterDocument.health -= enemyDocument.effects[0].duration * enemyDocument.effects[0].potency
            } else if (result === 'catastrófico') {
                // inflictedEffect = enemyDocument.effects[0].name;
                characterDocument.health -= enemyDocument.effects[0].duration * enemyDocument.effects[0].potency
            }
        }

        // Guarda los cambios en la base de datos
        if (characterDocument.id) {
            await Character.updateOne(
                { _id: characterDocument.id },
                { $set: { health: characterDocument.health } }
            );
        }

        if (enemyDocument._id) {
            await Enemy.updateOne(
                { _id: enemyDocument._id },
                { $set: { health: enemyDocument.health } }
            );
        }

        // Devuelve el resultado final de la interacción
        return res.status(200).json({
            result,
            characterRoll,
            enemyRoll,
            inflictedEffect,
            character: characterDocument,
            enemy: enemyDocument,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Error durante la interacción' });
    }
};

module.exports = { interaction };
