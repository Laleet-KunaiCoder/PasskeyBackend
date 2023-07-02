import { Schema, model } from "mongoose";
import { UserModel, Authenticator } from "../all_types";

// Create a Schema for the Authenticator
const AuthenticatorSchema = new Schema<Authenticator>({
  credentialID: Buffer,
  credentialPublicKey: Buffer,
  counter: Number,
  credentialDeviceType: String,
  credentialBackedUp: Boolean,
  transports: String,
});

// Create a Schema for the User
const userSchema = new Schema<UserModel>(
  {
    id: { type: String, required: true },
    username: { type: String, required: true },
    currentChallenge: { type: String, default: null },
    device: { type: [AuthenticatorSchema], required: true },
  },
  {
    collection: "user",
  }
);

const User = model<UserModel>("User", userSchema);

async function createUser(userData: UserModel): Promise<UserModel> {
  try {
    const createdUser = await User.create(userData);
    return createdUser;
  } catch (error) {
    throw new Error("Failed to create user: " + error);
  }
}

async function findUserByUsername(username: string): Promise<UserModel | null> {
  try {
    const user = await User.findOne({ username });
    return user;
  } catch (error) {
    throw new Error("Failed to find user: " + error);
  }
}

async function findUserById(id: string): Promise<UserModel | null> {
  try {
    const user = await User.findOne({ id });
    return user;
  } catch (error) {
    throw new Error("Failed to find user: " + error);
  }
}

async function setCurrentChallenge(
  username: string,
  challenge: string
): Promise<UserModel | null> {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { username },
      { $set: { currentChallenge: challenge } },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    throw new Error("Failed to update current challenge: " + error);
  }
}

async function addDevice(
  userId: string,
  newDevice: Authenticator
): Promise<UserModel | null> {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { $push: { device: newDevice } },
      { new: true }
    );
    return updatedUser;
  } catch (error) {
    throw new Error("Failed to add device: " + error);
  }
}

export {
  User,
  createUser,
  findUserByUsername,
  setCurrentChallenge,
  findUserById,
  addDevice,
};
