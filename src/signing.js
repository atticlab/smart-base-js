//  This module provides the signing functionality used by the stellar network
//  The code below may look a little strange... this is because we try to provide
//  the most efficient signing method possible.  First, we try to load the 
//  native ed25519 package for node.js environments, and if that fails we
//  fallback to tweetnacl.js


var actualMethods = {};

export function sign(data, secretKey) {
  return actualMethods.sign(data, secretKey);
}

export function verify(data, signature, publicKey) {
  return actualMethods.verify(data, signature, publicKey);
}

// //// if in node 
if (typeof window === 'undefined') {
  // NOTE: we use commonjs style require here because es6 imports
  // can only occur at the top level.  thanks, obama.
  let ed25519 = require("ed25519");

  actualMethods.sign = function(data, secretKey) {
    data = new Buffer(data);
    return ed25519.Sign(data, secretKey);
  };

  actualMethods.verify = function(data, signature, publicKey) {
    data = new Buffer(data);
    try {
      return ed25519.Verify(data, signature, publicKey);
    } catch(e) {
      return false;
    }
  };

} else {
// fallback to tweetnacl.js if we're in the browser

  let nacl = require("./util/nacl_util");

  actualMethods.sign = function (data, secretKey) {
    data = new Buffer(data);
    data = new Uint8Array(data.toJSON().data);
    secretKey = new Uint8Array(secretKey.toJSON().data);

    let signature = nacl.sign.detached(data, secretKey);

    return new Buffer(signature);
  };

  actualMethods.verify = function (data, signature, publicKey) {
    data = new Buffer(data);
    data = new Uint8Array(data.toJSON().data);
    signature = new Uint8Array(signature.toJSON().data);
    publicKey = new Uint8Array(publicKey.toJSON().data);

    return nacl.sign.detached.verify(data, signature, publicKey);
  };
}