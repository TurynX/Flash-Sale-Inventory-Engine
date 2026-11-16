import { BadRequestException, Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { InventoryLedgerPort } from 'src/inventory-ledger/domain/ports/inventory-ledger.port';

@Injectable()
export class CreateInventoryLedgerUseCase {
  constructor(
    private readonly inventoryLedgerPort: InventoryLedgerPort,
    private readonly logger: Logger,
  ) {}

  async execute(
    productId: string,
    userId: string,
    quantity_change: number,
    type: string,
  ) {
    const inventoryLedger = await this.inventoryLedgerPort.create(
      productId,
      userId,
      quantity_change,
      type,
    );
    if (!inventoryLedger) {
      throw new BadRequestException('Inventory Ledger not created');
    }
    this.logger.log('Inventory ledger created');

    return inventoryLedger;
  }
}
