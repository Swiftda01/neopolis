import { Component } from '@angular/core';
import { ContractService } from './services/contract.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  numOfTowers: number = 5;
  towers: number[] = [];

  constructor(private contractService: ContractService) {}

  async ngOnInit(): Promise<void> {
    await this._getTowers();
    console.log(this.towers);
  }

  private async _getTowers() {
    this.towers = await this.contractService.getTowerHeights(this.numOfTowers);
  }
}
