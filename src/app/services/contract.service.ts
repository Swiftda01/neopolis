import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import Contract from '../../../artifacts/contracts/Neopolis.sol/Neopolis.json';
import detectEthereumProvider from '@metamask/detect-provider';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  constructor() {}

  async getTowerHeights(numberOfTowers: number) {
    return await Promise.all(
      Array(numberOfTowers)
        .fill(0)
        .map(async (_, index) => {
          return this._getTowerHeight(index + 1);
        })
    );
  }

  private async _getTowerHeight(index: number) {
    const contract: any = await this._getContract();

    return Number(await contract['heightOf'](index));
  }

  private async _getContract(bySigner = false) {
    const provider = await this._getWebProvider();
    const signer = provider.getSigner();

    return new ethers.Contract(
      '0xc0fa30c9c89fe9b8779826bcb19da1c1007054d8',
      Contract.abi,
      bySigner ? signer : provider
    );
  }

  private async _getWebProvider(requestAccounts = true) {
    const provider: any = await detectEthereumProvider();

    if (requestAccounts) {
      await provider.request({ method: 'eth_requestAccounts' });
    }

    return new ethers.providers.Web3Provider(provider);
  }
}
