import { TaquitoError } from '@taquito/core';

export class SignerNotFoundError extends TaquitoError {
  constructor(
    private readonly curve: string,
    public override readonly cause?: unknown
  ) {
    super();
    this.name = 'SignerNotFoundError';
    this.message = `Signer ${this.curve} not found`;
  }
}

export class PublicKeyRetrievalError extends TaquitoError {
  constructor(public override readonly cause?: unknown) {
    super();
    this.name = 'PublicKeyRetrievalError';
    this.message = 'Unable to retrieve Public Key';
  }
}

export class PublicKeyHashRetrievalError extends TaquitoError {
  constructor(public override readonly cause?: unknown) {
    super();
    this.name = 'PublicKeyHashRetrievalError';
    this.message = 'Unable to retrieve Public Key Hash';
  }
}
