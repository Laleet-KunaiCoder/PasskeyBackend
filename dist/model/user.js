"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDevice = exports.findUserById = exports.setCurrentChallenge = exports.findUserByUsername = exports.createUser = exports.User = void 0;
const mongoose_1 = require("mongoose");
// Create a Schema for the Authenticator
const AuthenticatorSchema = new mongoose_1.Schema({
    credentialID: Buffer,
    credentialPublicKey: Buffer,
    counter: Number,
    credentialDeviceType: String,
    credentialBackedUp: Boolean,
    transports: String,
});
// Create a Schema for the User
const userSchema = new mongoose_1.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true },
    currentChallenge: { type: String, default: null },
    device: { type: [AuthenticatorSchema], required: true },
}, {
    collection: "user",
});
const User = (0, mongoose_1.model)("User", userSchema);
exports.User = User;
async function createUser(userData) {
    try {
        const createdUser = await User.create(userData);
        return createdUser;
    }
    catch (error) {
        throw new Error("Failed to create user: " + error);
    }
}
exports.createUser = createUser;
async function findUserByUsername(username) {
    try {
        const user = await User.findOne({ username });
        return user;
    }
    catch (error) {
        throw new Error("Failed to find user: " + error);
    }
}
exports.findUserByUsername = findUserByUsername;
async function findUserById(id) {
    try {
        const user = await User.findOne({ id });
        return user;
    }
    catch (error) {
        throw new Error("Failed to find user: " + error);
    }
}
exports.findUserById = findUserById;
async function setCurrentChallenge(username, challenge) {
    try {
        const updatedUser = await User.findOneAndUpdate({ username }, { $set: { currentChallenge: challenge } }, { new: true });
        return updatedUser;
    }
    catch (error) {
        throw new Error("Failed to update current challenge: " + error);
    }
}
exports.setCurrentChallenge = setCurrentChallenge;
async function addDevice(userId, newDevice) {
    try {
        const updatedUser = await User.findOneAndUpdate({ id: userId }, { $push: { device: newDevice } }, { new: true });
        return updatedUser;
    }
    catch (error) {
        throw new Error("Failed to add device: " + error);
    }
}
exports.addDevice = addDevice;
//# sourceMappingURL=user.js.map