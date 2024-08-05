const axios = require('axios');

exports.startGame = async (req, res) => {
    try {
        const response = await axios.post('URL_DE_L_API_DE_BLACKJACK');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Erreur lors du démarrage du jeu de blackjack');
    }
};
