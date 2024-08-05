const User = require('../models/User');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const KrakenClient = require('kraken-api');
const kraken = new KrakenClient(process.env.KRAKEN_API_KEY, process.env.KRAKEN_API_SECRET);

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_HOST_USER,
    pass: process.env.EMAIL_HOST_PASSWORD
  }
});

// Afficher la page de login
exports.getLogin = (req, res) => {
  res.render('login');
};

// Afficher la page d'inscription
exports.getRegister = (req, res) => {
  res.render('register');
};

// Afficher la page de réinitialisation de mot de passe
exports.getForgotPassword = (req, res) => {
  res.render('forgot-password');
};

// Inscription de l'utilisateur
exports.postRegister = async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword, balance: 0 });
  await newUser.save();
  res.redirect('/login');
};

// Connexion de l'utilisateur
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user._id;
    res.redirect('/home');
  } else {
    res.redirect('/login');
  }
};

// Déconnexion de l'utilisateur
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/login');
};

// Afficher la page d'accueil
exports.getHome = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.redirect('/login');
  }
  res.render('home', { user });
};

// Afficher la page de profil
exports.getProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.redirect('/login');
  }
  res.render('profile', { user });
};

// Réinitialisation du mot de passe
exports.postForgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    // Générer un token de réinitialisation (vous pouvez utiliser un package comme crypto)
    const resetToken = 'generated-reset-token'; // Remplacez par votre logique de génération de token

    // Envoyer l'email de réinitialisation
    const mailOptions = {
      from: process.env.EMAIL_HOST_USER,
      to: user.email,
      subject: 'Password Reset',
      text: `You requested a password reset. Click the link to reset your password: http://localhost:3000/reset-password?token=${resetToken}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).send('Error sending email');
      }
      console.log('Email sent:', info.response);
      res.redirect('/login');
    });
  } else {
    res.redirect('/forgot-password');
  }
};

// Afficher la page de dépôt
exports.getDeposit = (req, res) => {
  res.render('deposit', { publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
};

// Gérer le dépôt par carte
exports.postDeposit = async (req, res) => {
  const { amount, stripeToken } = req.body;
  const charge = await stripe.charges.create({
    amount: amount * 100, // Montant en centimes
    currency: 'eur',
    source: stripeToken,
    description: 'Deposit for Crash Game',
  });

  const user = await User.findById(req.session.userId);
  if (!user) {
    return res.status(404).send('User not found');
  }
  user.balance += amount;
  await user.save();

  res.redirect('/home');
};

// Afficher la page de dépôt par crypto
exports.getCryptoDeposit = (req, res) => {
  res.render('crypto-deposit');
};

// Gérer le dépôt par crypto avec Kraken
exports.postCryptoDeposit = async (req, res) => {
  const { amount, currency } = req.body;
  try {
    // Obtenir les méthodes de financement disponibles
    const methods = await kraken.api('DepositMethods', { asset: currency });
    console.log('Funding Methods:', methods); // Ajoute cette ligne pour vérifier les méthodes de financement

    if (methods.length === 0) {
      throw new Error('No funding methods available for this asset');
    }

    // Utiliser la première méthode de financement disponible
    const method = methods[0].method;

    // Obtenir l'adresse de dépôt
    const depositAddress = await kraken.api('DepositAddresses', { asset: currency, method });
    console.log('Deposit Address:', depositAddress); // Ajoute cette ligne pour vérifier l'adresse de dépôt

    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    // Logique pour ajouter le montant au solde de l'utilisateur après confirmation du dépôt
    user.balance += parseFloat(amount);
    await user.save();
    res.redirect('/home');
  } catch (error) {
    console.error('Error:', error.message);
    res.redirect('/crypto-deposit');
  }
};

// Gérer les paris
exports.placeBet = async (req, res) => {
  const { userId, betAmount } = req.body;
  const user = await User.findById(userId);

  if (!user || user.balance < betAmount) {
    return res.status(400).send('Insufficient balance or user not found');
  }

  user.balance -= betAmount;
  await user.save();

  const result = Math.random() > 0.5 ? 'win' : 'lose'; // Exemple simplifié
  res.json({ result });
};

// Réinitialisation du mot de passe
exports.postResetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  // Vérifiez le token et réinitialisez le mot de passe de l'utilisateur
  // Ajoutez votre logique de vérification de token ici

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  // Mettez à jour le mot de passe de l'utilisateur dans la base de données
  // Ajoutez votre logique de mise à jour de mot de passe ici

  res.redirect('/login');
};
