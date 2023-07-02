import { Request, Response } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { UserModel, Authenticator } from "../all_types";
import {
  createUser,
  findUserByUsername,
  findUserById,
  setCurrentChallenge,
  addDevice,
} from "../model/user";

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
const getRegistration = async (req: Request, res: Response) => {
  try {
    // Username of the user
    const userName = "laleet";

    // Find the user in the database based on the username
    let userInDB: UserModel | null = await findUserByUsername(userName);

    if (!userInDB) {
      // Create a new user if not found in the database
      const newUser: UserModel = {
        id: uid(),
        username: userName,
        device: [], // Empty array for storing authenticators
      };
      userInDB = await createUser(newUser);
    }

    const userAuthenticators: Authenticator[] = userInDB.device;

    // Generate registration options for the user
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID: userInDB.id,
      userName: userInDB.username,
      // Don't prompt users for additional information about the authenticator
      // (Recommended for smoother UX)
      timeout: 60000,
      attestationType: "none",
      // Prevent users from re-registering existing authenticators
      excludeCredentials: userAuthenticators?.map((authenticator) => ({
        id: Buffer.from(authenticator.credentialID),
        type: "public-key",
        // Optional
        transports: authenticator.transports,
      })),
      supportedAlgorithmIDs: [-7, -257],
    });

    // Set the current challenge for the user
    userInDB = await setCurrentChallenge(userName, options.challenge);

    // Send the registration options to the client
    res.send(options);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// Handler for verifying the registration response
const verifyRegistration = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const userId = body.user.id;

    // Find the user in the database based on the user ID
    let userInDB: UserModel | null = await findUserById(userId);
    const expectedChallenge: string | undefined = userInDB?.currentChallenge;

    if (!userInDB || !expectedChallenge) {
      // Invalid user ID or challenge
      res.status(400).send("Invalid user ID");
      return;
    }

    let verification;
    try {
      // Verify the registration response
      verification = await verifyRegistrationResponse({
        response: body.attestationResponse,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
      });
    } catch (error) {
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

    const {
      credentialPublicKey,
      credentialID,
      counter,
      credentialDeviceType,
      credentialBackedUp,
    } = registrationInfo;

    const newAuthenticator: Authenticator = {
      credentialID: Buffer.from(credentialID),
      credentialPublicKey: Buffer.from(credentialPublicKey),
      counter,
      credentialDeviceType,
      credentialBackedUp,
    };

    // Add the new device to the user's list of devices
    userInDB = await addDevice(userId, newAuthenticator);

    res.send(verified);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export { getRegistration, verifyRegistration };
