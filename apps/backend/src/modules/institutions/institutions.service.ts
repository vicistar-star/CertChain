import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution, InstitutionStatus } from './entities/institution.entity';

@Injectable()
export class InstitutionsService {
  constructor(
    @InjectRepository(Institution)
    private repo: Repository<Institution>,
  ) {}

  async findOrCreateByPublicKey(publicKey: string): Promise<Institution> {
    let inst = await this.repo.findOne({ where: { stellarPublicKey: publicKey } });
    if (!inst) {
      inst = this.repo.create({ stellarPublicKey: publicKey });
      await this.repo.save(inst);
    }
    return inst;
  }

  async findById(id: string): Promise<Institution> {
    const inst = await this.repo.findOne({ where: { id } });
    if (!inst) throw new NotFoundException('Institution not found');
    return inst;
  }

  async findByPublicKey(publicKey: string): Promise<Institution> {
    const inst = await this.repo.findOne({ where: { stellarPublicKey: publicKey } });
    if (!inst) throw new NotFoundException('Institution not found');
    return inst;
  }

  async updateProfile(id: string, data: Partial<Institution>): Promise<Institution> {
    await this.repo.update(id, data);
    return this.findById(id);
  }

  async activate(id: string): Promise<Institution> {
    await this.repo.update(id, { status: InstitutionStatus.ACTIVE });
    return this.findById(id);
  }

  async getStats(institutionId: string) {
    const inst = await this.findById(institutionId);
    const { total, revoked, valid } = await this.repo
      .createQueryBuilder('i')
      .leftJoin('i.credentials', 'c')
      .select([
        'COUNT(c.id) as total',
        "SUM(CASE WHEN c.status = 'REVOKED' THEN 1 ELSE 0 END) as revoked",
        "SUM(CASE WHEN c.status = 'VALID' THEN 1 ELSE 0 END) as valid",
      ])
      .where('i.id = :id', { id: institutionId })
      .getRawOne();

    return { institution: inst, stats: { total: +total, revoked: +revoked, valid: +valid } };
  }
}
