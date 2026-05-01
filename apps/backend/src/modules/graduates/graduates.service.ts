import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Graduate } from './entities/graduate.entity';

@Injectable()
export class GraduatesService {
  constructor(
    @InjectRepository(Graduate)
    private repo: Repository<Graduate>,
  ) {}

  async findOrCreateByPublicKey(publicKey: string): Promise<Graduate> {
    let grad = await this.repo.findOne({ where: { stellarPublicKey: publicKey } });
    if (!grad) {
      grad = this.repo.create({ stellarPublicKey: publicKey });
      await this.repo.save(grad);
    }
    return grad;
  }

  async findById(id: string): Promise<Graduate> {
    const grad = await this.repo.findOne({ where: { id } });
    if (!grad) throw new NotFoundException('Graduate not found');
    return grad;
  }

  async updateProfile(id: string, data: Partial<Graduate>): Promise<Graduate> {
    await this.repo.update(id, data);
    return this.findById(id);
  }
}
