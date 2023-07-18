# Passkey Backend

The implementation described is based on Express, a popular web application framework for Node.js, and it utilizes TypeScript, a statically-typed superset of JavaScript, for development. The implementation incorporates two specific libraries: **@simplewebauthn/server** and **@simplewebauthn/browser**.

**@simplewebauthn/server** is a fully-functional reference implementation of the Web Authentication (WebAuthn) server-side functionality. WebAuthn is a web standard that provides an API for creating and using public key credentials, allowing users to authenticate themselves securely without relying on passwords. The server-side implementation provided by **@simplewebauthn/server** enables the server to handle the necessary operations for WebAuthn, such as registration and authentication.

By combining the features of **@simplewebauthn/server** the Express TypeScript implementation can provide a complete WebAuthn solution. Users can securely register and authenticate themselves using public key credentials, enhancing the security and usability of the authentication process compared to traditional password-based methods.

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Install the dependencies by running the following command:

```shell
npm install
```

To start the nodemon server, run the following command:

```shell
npm run dev
```

To build the production-ready version of the backend applicaiton, run the following command

```shell
npm run build
```

The optimized build will be available in the dist directory.
To format the all the javascript code you can user:

```shell
npm run format
```

#### API endpoint

```http
Registration:
  GET /generate-registration-options
  POST /verify-registration

Athentication

  GET /generate-authentication-options
  POST /verify-authentication
```
