import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluation } from './entities/evaluation.entity';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

@Injectable()
export class EvaluationsService {
  constructor(
    @InjectRepository(Evaluation)
    private evalRepo: Repository<Evaluation>,
  ) {}

  async create(createDto: CreateEvaluationDto, userId: number) {
    const evaluation = this.evalRepo.create({ ...createDto, userId });
    return this.evalRepo.save(evaluation);
  }

  async findAll(page: number = 1, limit: number = 10) {
    const [data, total] = await this.evalRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const evaluation = await this.evalRepo.findOne({ where: { id } });
    if (!evaluation) throw new NotFoundException('Evaluation not found');
    return evaluation;
  }

  async update(id: number, updateDto: Partial<CreateEvaluationDto>) {
    const evaluation = await this.findOne(id);
    Object.assign(evaluation, updateDto);
    return this.evalRepo.save(evaluation);
  }

  async remove(id: number) {
    const evaluation = await this.findOne(id);
    return this.evalRepo.remove(evaluation);
  }
}
