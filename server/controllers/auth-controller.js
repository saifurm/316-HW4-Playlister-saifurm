const auth = require('../auth');
const bcrypt = require('bcryptjs');
const { getDatabaseManager, DatabaseError } = require('../db');

const db = getDatabaseManager();

const handleDatabaseError = (res, error) => {
    if (error instanceof DatabaseError) {
        return res.status(error.status || 500).json({
            errorMessage: error.message
        });
    }
    console.error(error);
    return res.status(500).json({
        errorMessage: 'Internal server error'
    });
};

getLoggedIn = async (req, res) => {
    try {
        const userId = auth.verifyUser(req);
        if (!userId) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            });
        }

        const loggedInUser = await db.getUserById(userId);
        if (!loggedInUser) {
            return res.status(200).json({
                loggedIn: false,
                user: null,
                errorMessage: "?"
            });
        }

        return res.status(200).json({
            loggedIn: true,
            user: {
                firstName: loggedInUser.firstName,
                lastName: loggedInUser.lastName,
                email: loggedInUser.email
            }
        });
    } catch (err) {
        return handleDatabaseError(res, err);
    }
};

loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        const existingUser = await db.getUserByEmail(email);
        if (!existingUser) {
            return res.status(401).json({
                errorMessage: "Wrong email or password provided."
            });
        }

        const passwordCorrect = await bcrypt.compare(password, existingUser.passwordHash);
        if (!passwordCorrect) {
            return res.status(401).json({
                errorMessage: "Wrong email or password provided."
            });
        }

        const token = auth.signToken(existingUser._id);

        return res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        }).status(200).json({
            success: true,
            user: {
                firstName: existingUser.firstName,
                lastName: existingUser.lastName,
                email: existingUser.email
            }
        });
    } catch (err) {
        return handleDatabaseError(res, err);
    }
};

logoutUser = async (req, res) => {
    return res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none"
    }).send();
};

registerUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, passwordVerify } = req.body;

        if (!firstName || !lastName || !email || !password || !passwordVerify) {
            return res
                .status(400)
                .json({ errorMessage: "Please enter all required fields." });
        }

        if (password.length < 8) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter a password of at least 8 characters."
                });
        }

        if (password !== passwordVerify) {
            return res
                .status(400)
                .json({
                    errorMessage: "Please enter the same password twice."
                });
        }

        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res
                .status(400)
                .json({
                    success: false,
                    errorMessage: "An account with this email address already exists."
                });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        const savedUser = await db.createUser({
            firstName,
            lastName,
            email,
            passwordHash,
            playlists: []
        });

        const token = auth.signToken(savedUser._id);

        return res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }).status(200).json({
            success: true,
            user: {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email
            }
        });
    } catch (err) {
        return handleDatabaseError(res, err);
    }
};

module.exports = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
};
