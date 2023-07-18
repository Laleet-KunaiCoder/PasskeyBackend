"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRegistration = exports.getRegistration = void 0;
const server_1 = require("@simplewebauthn/server");
const user_1 = require("../model/user");
// Human-readable title for your website
const rpName = "SimpleWebAuthn";
// A unique identifier for your website
const rpID = "localhost";
// The URL at which registrations and authentications should occur
const origin = "http://localhost:5173";
// Generate a unique user ID
const uid = () => {
    return Date.now().toString(36) + Math.random().toString(36);
};
// Handler for getting registration options
const getRegistration = async (req, res) => {
    try {
        // Username of the user
        const userName = req.query.username;
        const plt = req.query.plt;
        console.log(plt);
        // Find the user in the database based on the username
        let userInDB = await (0, user_1.findUserByUsername)(userName);
        if (!userInDB) {
            // Create a new user if not found in the database
            const newUser = {
                id: uid(),
                username: userName,
                device: [], // Empty array for storing authenticators
            };
            userInDB = await (0, user_1.createUser)(newUser);
        }
        const userAuthenticators = userInDB.device;
        // Generate registration options for the user
        const options = (0, server_1.generateRegistrationOptions)({
            rpName,
            rpID,
            userID: userInDB.id,
            userName: userInDB.username,
            // Don't prompt users for additional information about the authenticator
            // (Recommended for smoother UX)
            timeout: 60000,
            attestationType: "none",
            //Authenticator Selection
            authenticatorSelection: {
                authenticatorAttachment: plt,
            },
            // Prevent users from re-registering existing authenticators
            excludeCredentials: userAuthenticators === null || userAuthenticators === void 0 ? void 0 : userAuthenticators.map((authenticator) => ({
                id: Buffer.from(authenticator.credentialID),
                type: "public-key",
                // Optional
                transports: authenticator.transports,
            })),
            supportedAlgorithmIDs: [-7, -257],
        });
        // Set the current challenge for the user
        userInDB = await (0, user_1.setCurrentChallenge)(userName, options.challenge);
        // Send the registration options to the client
        res.send(options);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
exports.getRegistration = getRegistration;
// Handler for verifying the registration response
const verifyRegistration = async (req, res) => {
    try {
        const { body } = req;
        const userId = body.user.id;
        // Find the user in the database based on the user ID
        let userInDB = await (0, user_1.findUserById)(userId);
        const expectedChallenge = userInDB === null || userInDB === void 0 ? void 0 : userInDB.currentChallenge;
        if (!userInDB || !expectedChallenge) {
            // Invalid user ID or challenge
            res.status(400).send("Invalid user ID");
            return;
        }
        let verification;
        try {
            // Verify the registration response
            verification = await (0, server_1.verifyRegistrationResponse)({
                response: body.attestationResponse,
                expectedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
            });
        }
        catch (error) {
            console.error(error);
            res.status(400).send(error);
            return;
        }
        const { registrationInfo, verified } = verification;
        if (!verified || !registrationInfo) {
            // Verification failed
            res.status(400).send("Registration verification failed");
            return;
        }
        const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp, } = registrationInfo;
        const newAuthenticator = {
            credentialID: Buffer.from(credentialID),
            credentialPublicKey: Buffer.from(credentialPublicKey),
            counter,
            credentialDeviceType,
            credentialBackedUp,
        };
        // Add the new device to the user's list of devices
        userInDB = await (0, user_1.addDevice)(userId, newAuthenticator);
        res.send(verified);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
exports.verifyRegistration = verifyRegistration;
//# sourceMappingURL=regcontroller.js.map