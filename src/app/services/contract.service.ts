import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import Contract from '../../../artifacts/contracts/Neopolis.sol/Neopolis.json';
import detectEthereumProvider from '@metamask/detect-provider';

@Injectable({
  providedIn: 'root',
})
export class ContractService {
  serviceInitialized = false;
  provider: any;
  signer: any;

  constructor() {}

  async initialize(): Promise<void> {
    if (this.serviceInitialized) return;

    this.provider = await this._getWebProvider();
    this.signer = this.provider.getSigner();

    this.serviceInitialized = true;
  }

  async getSignerDetails(): Promise<any> {
    const contract: any = await this._getContract();
    const address = await this.signer.getAddress();
    const blockBalance = await contract['balanceOf'](address);
    return { address, blockBalance };
  }

  async placeBlock(index: number): Promise<any> {
    const contract: any = await this._getContract(true);

    return await contract['place'](index);
  }

  async getTowerHeights(numberOfTowers: number): Promise<number[]> {
    return await Promise.all(
      Array(numberOfTowers)
        .fill(0)
        .map(async (_, index) => {
          return this._getTowerHeight(index + 1);
        })
    );
  }

  private async _getTowerHeight(index: number): Promise<number> {
    const contract: any = await this._getContract();

    return Number(await contract['heightOf'](index));
  }

  private async _getWebProvider(requestAccounts = true): Promise<any> {
    const provider: any = await detectEthereumProvider();

    if (requestAccounts) {
      await provider.request({ method: 'eth_requestAccounts' });
    }

    return new ethers.providers.Web3Provider(provider);
  }

  private _getContract(bySigner = false): any {
    return new ethers.Contract(
      '0xc0fa30c9c89fe9b8779826bcb19da1c1007054d8',
      Contract.abi,
      bySigner ? this.signer : this.provider
    );
  }
}
