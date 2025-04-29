import { hash } from '@stablelib/blake2b';

import { AcurastSigner, Curve } from './signer.js';
import {
  PublicKeyHashRetrievalError,
  PublicKeyRetrievalError,
  SignerNotFoundError,
} from './errors.js';
import { ProhibitedActionError } from '@taquito/core';

function mock() {
  const signer = {
    sign: (payload: Buffer | Uint8Array | string): string => {
      const bytes =
        typeof payload === 'string' ? Buffer.from(payload, 'hex') : payload;

      return Buffer.from(hash(bytes, 64)).toString('hex');
    },
  };

  global._STD_ = {
    job: {
      getPublicKeys() {
        return {
          p256: '03070c7c8a6329d746c5a1de2fbcd5c6b7d6fa8df4e131e4d0828e2705a7d3bf92',
          secp256k1:
            '03de4551776b52ee506bc7ee083cdee304008ead1084377d22dfa3262cf495dc90',
          ed25519:
            'a70791af4337ff7987301e3ab643a103384294562d5bb4fabe4462de0e08d7b8',
        };
      },
    },
    signers: {
      secp256r1: signer,
      secp256k1: signer,
      ed25519: signer,
    },
  };
}

function emptyMock() {
  global._STD_ = {
    job: {
      getPublicKeys() {
        return {};
      },
    },
    signers: {},
  };
}

describe('AcurastSigner', () => {
  describe('ed25519', () => {
    let signer: AcurastSigner;

    beforeAll(() => {
      mock();
      signer = new AcurastSigner(Curve.ED25519);
    });

    it('should return an edpk public key', async () => {
      const pk = await signer.publicKey();

      expect(pk).toEqual(
        'edpkuunUy3Lib2tVJk9aTKo9dw5cqd2gyw3NYAmeBZVGsbmqbQr9Gy'
      );
    });

    it('should return a tz1 address', async () => {
      const pkh = await signer.publicKeyHash();

      expect(pkh).toEqual('tz1amh2ijBHuW3HegfoyaMXVXAFLqTiQ7aD8');
    });

    it('should sign an operation without magic byte', async () => {
      const op =
        '76afc9c804bd39aa52cd9bb0b770eb71d8c6f3ad5d2511ce2d86f25dde5d277e';
      const sig = await signer.sign(op);

      expect(sig.bytes).toEqual(op);
      expect(sig.sig).toEqual(
        'sigvujh2JL8y7vLR9Zgpy4dP8UvSMNJNKL6vDxNzwZBdYxWJAce9dSkiMBEDJESadikJK7N1EZECDcuaUbd9f1GdFrDVmaqW'
      );
      expect(sig.prefixSig).toEqual(
        'edsigu6jCp5XEQuJxPc8rprpFagQzhGSJH1BvUbyh7LwYByZup87D93YXqmb6Gov2Y3p5BqnjHX1v4pBPeNWoHHzyTgKxBRMEvc'
      );
      expect(sig.sbytes).toEqual(
        op +
          'fba3530af9adcc7a8716e7d9dbbd50154db7f87fe93000d342b9191a9dcd8d43729cc02066591afa7ba0d1eddf044d4582ac70a455781c0005dc4f33d7c858b0'
      );
    });

    it('should sign an operation with magic byte', async () => {
      const op =
        '76afc9c804bd39aa52cd9bb0b770eb71d8c6f3ad5d2511ce2d86f25dde5d277e';
      const sig = await signer.sign(op, new Uint8Array([3]));

      expect(sig.bytes).toEqual(op);
      expect(sig.sig).toEqual(
        'sigVTAHV23GHovR7yVRJva4WxwV8S72vredRpuUiZs3Va3vqEJ3cv96hszUM7jVvhoc8sh5tz9NQQgKGTJmJp3Y1JNVftxMf'
      );
      expect(sig.prefixSig).toEqual(
        'edsigtfGdQYEwYDzxUJxnZLmm1pFTFxX31ZjF17aeD4Zr3qb1EfAtYWqEBm7uWwjXbPtA3gMK1QmWD2NT44VWRTA1j4NUPxDTEJ'
      );
      expect(sig.sbytes).toEqual(
        op +
          '390bb58dd57d1fb426def4e2ba368625daa521d4f6338ecfb2d132dd76e82ff23586958de9e0f5c0c8be08ebb5e24c585ba9d37f6dd05e8b3279e8cbbc0798df'
      );
    });
  });

  describe('secp256k1', () => {
    let signer: AcurastSigner;

    beforeAll(() => {
      mock();
      signer = new AcurastSigner(Curve.SECP256K1);
    });

    it('should return a sppk public key', async () => {
      const pk = await signer.publicKey();

      expect(pk).toEqual(
        'sppk7cwGe6sVj2qVyh3df9rH8Q4nUsm7kB4MyfPpUWa5kP8oLRYMYhM'
      );
    });

    it('should return a tz2 address', async () => {
      const pkh = await signer.publicKeyHash();

      expect(pkh).toEqual('tz2CRqzkQb1biWbJoEeD6ABSTkibUAFqh9qW');
    });

    it('should sign an operation without magic byte', async () => {
      const op =
        '76afc9c804bd39aa52cd9bb0b770eb71d8c6f3ad5d2511ce2d86f25dde5d277e';
      const sig = await signer.sign(op);

      expect(sig.bytes).toEqual(op);
      expect(sig.sig).toEqual(
        'sigvujh2JL8y7vLR9Zgpy4dP8UvSMNJNKL6vDxNzwZBdYxWJAce9dSkiMBEDJESadikJK7N1EZECDcuaUbd9f1GdFrDVmaqW'
      );
      expect(sig.prefixSig).toEqual(
        'spsig1ejR25uacK64ib9KeyXDHHorqG8wNRx2aVMH9o6rzXUfwMpRpihphqq2vasKVyhaq24G6y6BfLNLzsBi92LWBqnxiTja64'
      );
      expect(sig.sbytes).toEqual(
        op +
          'fba3530af9adcc7a8716e7d9dbbd50154db7f87fe93000d342b9191a9dcd8d43729cc02066591afa7ba0d1eddf044d4582ac70a455781c0005dc4f33d7c858b0'
      );
    });

    it('should sign an operation with magic byte', async () => {
      const op =
        '76afc9c804bd39aa52cd9bb0b770eb71d8c6f3ad5d2511ce2d86f25dde5d277e';
      const sig = await signer.sign(op, new Uint8Array([3]));

      expect(sig.bytes).toEqual(op);
      expect(sig.sig).toEqual(
        'sigVTAHV23GHovR7yVRJva4WxwV8S72vredRpuUiZs3Va3vqEJ3cv96hszUM7jVvhoc8sh5tz9NQQgKGTJmJp3Y1JNVftxMf'
      );
      expect(sig.prefixSig).toEqual(
        'spsig1DGqcYdHjdn4oHyFPTUiiReKPxDg6zVM6zxEFWjArPVmMtt7EBzX3qMrAigpZKmfgrcqprqmoYZQQZARHBVYTDqV6ACKiF'
      );
      expect(sig.sbytes).toEqual(
        op +
          '390bb58dd57d1fb426def4e2ba368625daa521d4f6338ecfb2d132dd76e82ff23586958de9e0f5c0c8be08ebb5e24c585ba9d37f6dd05e8b3279e8cbbc0798df'
      );
    });
  });

  describe('p256', () => {
    let signer: AcurastSigner;

    beforeAll(() => {
      mock();
      signer = new AcurastSigner(Curve.P256);
    });

    it('should return a p2pk public key', async () => {
      const pk = await signer.publicKey();

      expect(pk).toEqual(
        'p2pk66a1cbNmg2eszGFVPDs6USJ3WfXfzxNqEQqKKQ4LoWJLf6LdueN'
      );
    });

    it('should return an tz3 address', async () => {
      const pkh = await signer.publicKeyHash();

      expect(pkh).toEqual('tz3aJWTZgryXnHDgAtbgHWctdByDyNRgmcde');
    });

    it('should sign an operation without magic byte', async () => {
      const op =
        '76afc9c804bd39aa52cd9bb0b770eb71d8c6f3ad5d2511ce2d86f25dde5d277e';
      const sig = await signer.sign(op);

      expect(sig.bytes).toEqual(op);
      expect(sig.sig).toEqual(
        'sigvujh2JL8y7vLR9Zgpy4dP8UvSMNJNKL6vDxNzwZBdYxWJAce9dSkiMBEDJESadikJK7N1EZECDcuaUbd9f1GdFrDVmaqW'
      );
      expect(sig.prefixSig).toEqual(
        'p2sigvDxY7PtES3xoMQKwYZbQtbGJq1bZTjkKMzomQPzUr1F3qSPxXgXyzXbXQEkg1qJ4vLdP5UVZhAwGyAXMk7ChtxC8qaYGz'
      );
      expect(sig.sbytes).toEqual(
        op +
          'fba3530af9adcc7a8716e7d9dbbd50154db7f87fe93000d342b9191a9dcd8d43729cc02066591afa7ba0d1eddf044d4582ac70a455781c0005dc4f33d7c858b0'
      );
    });

    it('should sign an operation with magic byte', async () => {
      const op =
        '76afc9c804bd39aa52cd9bb0b770eb71d8c6f3ad5d2511ce2d86f25dde5d277e';
      const sig = await signer.sign(op, new Uint8Array([3]));

      expect(sig.bytes).toEqual(op);
      expect(sig.sig).toEqual(
        'sigVTAHV23GHovR7yVRJva4WxwV8S72vredRpuUiZs3Va3vqEJ3cv96hszUM7jVvhoc8sh5tz9NQQgKGTJmJp3Y1JNVftxMf'
      );
      expect(sig.prefixSig).toEqual(
        'p2sigUmP8a7bMkjxt4EFg2X6r2RisX6LJ2H4qsbks82JLi2LUNW5MzyEKz4QmY4FjMuNvkuD6yE5huMzgf9EVuGEyGziSzFDdM'
      );
      expect(sig.sbytes).toEqual(
        op +
          '390bb58dd57d1fb426def4e2ba368625daa521d4f6338ecfb2d132dd76e82ff23586958de9e0f5c0c8be08ebb5e24c585ba9d37f6dd05e8b3279e8cbbc0798df'
      );
    });
  });

  describe('unknown', () => {
    let signer: AcurastSigner;

    beforeAll(() => {
      emptyMock();
      signer = new AcurastSigner();
    });

    it('should fail on secret key retrieval', () => {
      expect(signer.secretKey()).rejects.toBeInstanceOf(ProhibitedActionError);
    });

    it('should fail on public key retrieval', () => {
      expect(signer.publicKey()).rejects.toBeInstanceOf(
        PublicKeyRetrievalError
      );
    });

    it('should fail on address key retrieval', async () => {
      expect(signer.publicKeyHash()).rejects.toBeInstanceOf(
        PublicKeyHashRetrievalError
      );
    });

    it('should fail on sign attempt', async () => {
      expect(signer.sign('00')).rejects.toBeInstanceOf(SignerNotFoundError);
    });
  });
});
