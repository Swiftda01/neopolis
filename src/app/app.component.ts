import { Component } from '@angular/core';
import { ContractService } from './services/contract.service';
import web3Utils from './utils/web3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  signer: {
    address: string;
    shortenedAddress: string;
    blockBalance: number;
  } | null = null;
  numOfTowers: number = 5;
  towers: number[] = [];

  constructor(private contractService: ContractService) {}

  async ngOnInit(): Promise<void> {
    await this.contractService.initialize();
    this._getSignerDetails();
    this._getTowers();
  }

  async placeBlock(towerIndex: number) {
    await this.contractService.placeBlock(towerIndex + 1);
  }

  private async _getSignerDetails() {
    const signerDetails = await this.contractService.getSignerDetails();
    const shortenedAddress = web3Utils.shortenedAddress(signerDetails.address);
    this.signer = { ...signerDetails, shortenedAddress };
  }

  private async _getTowers() {
    this.towers = await this.contractService.getTowerHeights(this.numOfTowers);
  }
}
