"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuthentication = exports.getAuthentication = void 0;
const server_1 = require("@simplewebauthn/server");
const user_1 = require("../model/user");
const base64url_1 = __importDefault(require("base64url"));
const helpers_1 = require("@simplewebauthn/server/helpers");
// Human-readable title for your website
const rpName = "SimpleWebAuthn";
// A unique identifier for your website
const rpID = "localhost";
// The URL at which registrations and authentications should occur
const origin = "http://localhost:5173";
const getAuthentication = async (req, res) => {
    try {
        const userName = req.query.username;
        const userInDB = await (0, user_1.findUserByUsername)(userName);
        if (!userInDB) {
            return res.status(400).send("No user with this username");
        }
        const userAuthenticators = userInDB.device;
        const options = (0, server_1.generateAuthenticationOptions)({
            allowCredentials: userAuthenticators.map((authenticator) => ({
                id: authenticator.credentialID,
                type: "public-key",
                transports: authenticator.transports,
            })),
            userVerification: "preferred",
        });
        await (0, user_1.setCurrentChallenge)(userName, options.challenge);
        const user = { id: userInDB.id };
        res.status(200).send({ options, user });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
exports.getAuthentication = getAuthentication;
/**
 * Verify the authentication response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const verifyAuthentication = async (req, res) => {
    try {
        const { body } = req;
        const userId = body.user.id;
        const mainResponse = body.attestationResponse;
        const userInDB = await (0, user_1.findUserById)(userId);
        if (!userInDB) {
            return res.status(400).send("Invalid user ID");
        }
        const expectedChallenge = userInDB.currentChallenge;
        if (!expectedChallenge) {
            return res.status(400).send("No expected challenge found for the user");
        }
        let dbAuthenticator;
        const bodyCredIDBuffer = base64url_1.default.toBuffer(mainResponse.rawId);
        for (const dev of userInDB.device) {
            if (helpers_1.isoUint8Array.areEqual(dev.credentialID, bodyCredIDBuffer)) {
                dbAuthenticator = dev;
                break;
            }
        }
        if (!dbAuthenticator) {
            return res
                .status(400)
                .send("Authenticator is not registered with this site");
        }
        let verification;
        try {
            const opts = {
                response: mainResponse,
                expectedChallenge: expectedChallenge,
                expectedOrigin: origin,
                expectedRPID: rpID,
                authenticator: dbAuthenticator,
                requireUserVerification: true,
            };
            verification = await (0, server_1.verifyAuthenticationResponse)(opts);
        }
        catch (error) {
            console.error(error);
            return res.status(400).send({ error: error });
        }
        const { verified } = verification;
        await (0, user_1.setCurrentChallenge)(userInDB.username, "");
        res.send({ verified });
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};
exports.verifyAuthentication = verifyAuthentication;
//# sourceMappingURL=authcontroller.js.map