import { hash } from '@stablelib/blake2b';
import { ProhibitedActionError } from '@taquito/core';
import { Signer } from '@taquito/taquito';
import { b58cencode, Prefix, prefix } from '@taquito/utils';

import {
  PublicKeyHashRetrievalError,
  PublicKeyRetrievalError,
  SignerNotFoundError,
} from './errors.js';

declare let _STD_: any;

export enum Curve {
  ED25519 = 'ed25519', // tz1
  SECP256K1 = 'secp256k1', // tz2
  P256 = 'p256', // tz3
}

interface RawSigner {
  sign: (payload: Buffer | Uint8Array | string) => string;
}

export class AcurastSigner implements Signer {
  public constructor(private readonly curve: Curve = Curve.P256) {}

  public async sign(
    op: string,
    magicByte?: Uint8Array
  ): Promise<{
    bytes: string;
    sig: string;
    prefixSig: string;
    sbytes: string;
  }> {
    const signer = this.rawSigner();
    if (!signer) {
      throw new SignerNotFoundError(this.curve);
    }

    const payload = Buffer.concat([
      magicByte ? Buffer.from(magicByte) : Buffer.alloc(0),
      Buffer.from(op, 'hex'),
    ]);

    const signature = signer.sign(hash(payload, 32));

    return {
      bytes: op,
      sig: b58cencode(signature, prefix[Prefix.SIG]),
      prefixSig: b58cencode(signature, this.getPrefixes().prefSig),
      sbytes: op + signature,
    };
  }

  public async publicKey(): Promise<string> {
    const publicKey = this.rawPublicKey();
    if (!publicKey) {
      throw new PublicKeyRetrievalError();
    }

    const prefixes = this.getPrefixes();
    return b58cencode(publicKey, prefixes.prefPk);
  }

  public async publicKeyHash(): Promise<string> {
    const publicKey = this.rawPublicKey();
    if (!publicKey) {
      throw new PublicKeyHashRetrievalError();
    }

    const prefixes = this.getPrefixes();
    return b58cencode(hash(publicKey, 20), prefixes.prefPkh);
  }

  public async secretKey(): Promise<string> {
    throw new ProhibitedActionError('Secret key cannot be exposed');
  }

  private rawSigner(): RawSigner | undefined {
    return _STD_.signers[this.getSignerName()];
  }

  private rawPublicKey(): Buffer | undefined {
    const publicKey = _STD_.job.getPublicKeys()[this.getPublicKeyName()];
    if (!publicKey) {
      return undefined;
    }

    return Buffer.from(publicKey, 'hex');
  }

  private getPrefixes(): {
    prefPk: Uint8Array;
    prefPkh: Uint8Array;
    prefSig: Uint8Array;
  } {
    switch (this.curve) {
      case Curve.ED25519:
        return {
          prefPk: prefix[Prefix.EDPK],
          prefPkh: prefix[Prefix.TZ1],
          prefSig: prefix[Prefix.EDSIG],
        };
      case Curve.SECP256K1:
        return {
          prefPk: prefix[Prefix.SPPK],
          prefPkh: prefix[Prefix.TZ2],
          prefSig: prefix[Prefix.SPSIG],
        };
      case Curve.P256:
        return {
          prefPk: prefix[Prefix.P2PK],
          prefPkh: prefix[Prefix.TZ3],
          prefSig: prefix[Prefix.P2SIG],
        };
    }
  }

  private getSignerName(): string {
    switch (this.curve) {
      case Curve.P256:
        return 'secp256r1';
      default:
        return this.curve;
    }
  }

  private getPublicKeyName(): string {
    return this.curve;
  }
}
