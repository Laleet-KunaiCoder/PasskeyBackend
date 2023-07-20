import { Request, Response } from "express";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import { UserModel, Authenticator } from "../types";
import {
  findUserByUsername,
  setCurrentChallenge,
  findUserById,
} from "../model/user";
import base64url from "base64url";
import type {
  VerifyAuthenticationResponseOpts,
  VerifiedAuthenticationResponse,
} from "@simplewebauthn/server";

import { isoUint8Array } from "@simplewebauthn/server/helpers";

// Human-readable title for your website
const rpName = "SimpleWebAuthn";
// A unique identifier for your website
const rpID = "localhost";
// The URL at which registrations and authentications should occur
const origin = "http://localhost:5173";

const getAuthentication = async (req: Request, res: Response) => {
  try {
    const userName: any = req.query.username;
    const userInDB: UserModel | null = await findUserByUsername(userName);

    if (!userInDB) {
      return res.status(400).send("No user with this username");
    }

    const userAuthenticators: Authenticator[] = userInDB.device;
    const options = generateAuthenticationOptions({
      allowCredentials: userAuthenticators.map((authenticator) => ({
        id: authenticator.credentialID,
        type: "public-key",
        transports: authenticator.transports,
      })),
      userVerification: "preferred",
    });

    await setCurrentChallenge(userName, options.challenge);
    const user = { id: userInDB.id };
    res.status(200).send({ options, user });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

/**
 * Verify the authentication response.
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
const verifyAuthentication = async (req: Request, res: Response) => {
  try {
    const { body } = req;
    const userId = body.user.id;
    const mainResponse = body.attestationResponse;
    const userInDB: UserModel | null = await findUserById(userId);

    if (!userInDB) {
      return res.status(400).send("Invalid user ID");
    }

    const expectedChallenge = userInDB.currentChallenge;

    if (!expectedChallenge) {
      return res.status(400).send("No expected challenge found for the user");
    }

    let dbAuthenticator: Authenticator | undefined;
    const bodyCredIDBuffer = base64url.toBuffer(mainResponse.rawId);

    for (const dev of userInDB.device) {
      if (isoUint8Array.areEqual(dev.credentialID, bodyCredIDBuffer)) {
        dbAuthenticator = dev;
        break;
      }
    }

    if (!dbAuthenticator) {
      return res
        .status(400)
        .send("Authenticator is not registered with this site");
    }

    let verification: VerifiedAuthenticationResponse;

    try {
      const opts: VerifyAuthenticationResponseOpts = {
        response: mainResponse,
        expectedChallenge: expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpID,
        authenticator: dbAuthenticator,
        requireUserVerification: true,
      };

      verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
      console.error(error);
      return res.status(400).send({ error: error });
    }

    const { verified } = verification;

    await setCurrentChallenge(userInDB.username, "");

    res.send({ verified });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

export { getAuthentication, verifyAuthentication };
