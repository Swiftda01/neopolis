import { Component } from '@angular/core';
import { ContractService } from './services/contract.service';
import web3Utils from './utils/web3';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(2000, style({ opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent {
  connectedToNeonNetwork = false;

  signer: {
    address: string;
    shortenedAddress: string;
    blockBalance: number;
    hasBlocks: boolean;
  } | null = null;
  numOfTowers: number = 5;
  towers: number[] = [];
  blockPlacementInProgress = false;

  constructor(private contractService: ContractService) {}

  async ngOnInit(): Promise<void> {
    this.connectedToNeonNetwork = await this.contractService.initialize();

    if (this.connectedToNeonNetwork) {
      this._getSignerDetails();
      this._getTowers();
    }
  }

  async placeBlock(towerIndex: number) {
    if (this.blockPlacementInProgress) return;

    this.blockPlacementInProgress = true;

    await this.contractService.placeBlock(towerIndex + 1).catch((error) => {
      console.log(error);
    });

    await this._getTowers();
    this.blockPlacementInProgress = false;
  }

  private async _getSignerDetails() {
    const signerDetails = await this.contractService.getSignerDetails();
    const shortenedAddress = web3Utils.shortenedAddress(signerDetails.address);
    const hasBlocks = signerDetails.blockBalance > 0;
    this.signer = { ...signerDetails, shortenedAddress, hasBlocks };
  }

  private async _getTowers() {
    this.towers = await this.contractService.getTowerHeights(this.numOfTowers);
  }
}
