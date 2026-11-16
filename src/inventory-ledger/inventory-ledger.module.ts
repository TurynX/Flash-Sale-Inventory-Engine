import { Module } from '@nestjs/common';
import { CreateInventoryLedgerUseCase } from './application/use-cases/create.inventory-ledger.use-case';
import { InventoryLedgerRepository } from './infrastructure/repositories/inventory-ledger.repository';
import { InventoryLedgerPort } from './domain/ports/inventory-ledger.port';

@Module({
  providers: [
    { provide: InventoryLedgerPort, useClass: InventoryLedgerRepository },
    CreateInventoryLedgerUseCase,
  ],
  exports: [InventoryLedgerPort],
})
export class InventoryLedgerModule {}
