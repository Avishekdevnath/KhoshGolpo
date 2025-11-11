import PrismaClientModule from '@prisma/client/index';

export const { PrismaClient } = PrismaClientModule;
export type PrismaClient = PrismaClientModule.PrismaClient;
